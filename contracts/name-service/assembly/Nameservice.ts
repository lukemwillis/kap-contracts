import { Arrays, authority, Crypto, error, Protobuf, SafeMath, StringBytes, System, system_calls, Token, value } from "@koinos/sdk-as";
import { AUTHORIZE_MINT_ENTRYPOINT, AUTHORIZE_RENEWAL_ENTRYPOINT, AUTHORIZE_BURN_ENTRYPOINT, NAME, SYMBOL, URI } from "./Constants";
import { nameservice } from "./proto/nameservice";
import { OwnersIndex } from "./state/OwnersIndex";
import { Metadata } from "./state/Metadata";
import { Names } from "./state/Names";
import { OperatorApprovals } from "./state/OperatorApprovals";
import { NameApprovals } from "./state/NameApprovals";
import { Supply } from "./state/Supply";
import { ParsedName } from "./ParsedName";

export class Nameservice {
  contractId: Uint8Array = System.getContractId();
  metadata: Metadata = new Metadata(this.contractId);
  names: Names = new Names(this.contractId);
  operatorApprovals: OperatorApprovals = new OperatorApprovals(this.contractId);
  ownersIndex: OwnersIndex = new OwnersIndex(this.contractId);
  supply: Supply = new Supply(this.contractId);
  nameApprovals: NameApprovals = new NameApprovals(this.contractId);
  now: u64 = System.getHeadInfo().head_block_time;

  authorize(args: authority.authorize_arguments): authority.authorize_result {
    const metadata = this.metadata.get()!;

    // if the owner is not this contract id, then check authority of owner
    if (metadata.owner.length > 0 && !Arrays.equal(this.contractId, metadata.owner)) {
      return new authority.authorize_result(
        System.checkAuthority(
          args.type,
          metadata.owner
        )
      );
    } else {
      // otherwise check transaction signatures
      const transactionId = System.getTransactionField('id')!.bytes_value;
      const signatures = Protobuf.decode<value.list_type>(System.getTransactionField('signatures')!.message_value!.value!, value.list_type.decode);

      let signature: Uint8Array;
      let recoveredKey: Uint8Array;
      let addr: Uint8Array;

      for (let i = 0; i < signatures.values.length; i++) {
        signature = signatures.values[i].bytes_value;
        recoveredKey = System.recoverPublicKey(signature, transactionId)!;
        addr = Crypto.addressFromPublicKey(recoveredKey);

        if (Arrays.equal(addr, this.contractId)) {
          return new authority.authorize_result(true);
        }
      }
    }

    return new authority.authorize_result(false);
  }

  // KCS-2 nameservice STANDARD https://github.com/koinos/koinos-contract-standards/blob/master/KCSs/kcs-2.md

  name(args: nameservice.name_arguments): nameservice.string_object {
    return new nameservice.string_object(NAME);
  }

  symbol(args: nameservice.symbol_arguments): nameservice.string_object {
    return new nameservice.string_object(SYMBOL);
  }

  uri(args: nameservice.uri_arguments): nameservice.string_object {
    return new nameservice.string_object(URI);
  }

  total_supply(args: nameservice.total_supply_arguments): nameservice.uint64_object {
    const supply = this.supply.get()!;
    return new nameservice.uint64_object(supply.value);
  }

  royalties(args: nameservice.royalties_arguments): nameservice.royalties_result {
    return new nameservice.royalties_result();
  }

  set_royalties(args: nameservice.set_royalties_arguments): nameservice.empty_object {
    // not supported
    return new nameservice.empty_object();
  }

  owner(args: nameservice.owner_arguments): nameservice.bytes_address_object {
    const metadata = this.metadata.get()!;
    return new nameservice.bytes_address_object(metadata.owner);
  }

  transfer_ownership(args: nameservice.transfer_ownership_arguments): nameservice.empty_object {
    // only this contract owner can update the owner
    System.requireAuthority(authority.authorization_type.contract_call, this.contractId);

    const owner = args.owner;
    System.require(owner.length > 0, 'argument "owner" is missng');

    const metadata = this.metadata.get()!;
    metadata.owner = owner;

    this.metadata.put(metadata);

    return new nameservice.empty_object();
  }

  balance_of(args: nameservice.balance_of_arguments): nameservice.uint64_object {
    const owner = args.owner;

    let ownerIndexKey = new nameservice.owner_index_key(
      owner,
      // a sha256 multihash is 34 bytes long (2 bytes for the multihash code, and 32 bytes for the digest)
      // to get the first element in the index, use a hash where all the bytes are set to 0
      new Uint8Array(34).fill(u8.MIN_VALUE)
    );

    let result: u64 = 0;

    let nameObj: nameservice.name_object | null;
    let ownerIndexObj: system_calls.database_object | null;
    let tmpName: string;
    let tmpOwnerIndexKey: nameservice.owner_index_key;

    do {
      ownerIndexObj = this.ownersIndex.getNext(ownerIndexKey);

      if (ownerIndexObj) {
        tmpOwnerIndexKey = Protobuf.decode<nameservice.owner_index_key>(ownerIndexObj.key, nameservice.owner_index_key.decode);

        if (Arrays.equal(tmpOwnerIndexKey.owner, owner)) {
          tmpName = StringBytes.bytesToString(ownerIndexObj.value);
          nameObj = this.getName(tmpName);

          if (nameObj != null) {
            // we don't check for overflow here
            // it is unlikely users will have more than u64.MAX_VALUE names
            result++;
          }

          ownerIndexKey = tmpOwnerIndexKey;
        } else {
          break;
        }
      }

    } while (ownerIndexObj != null);

    return new nameservice.uint64_object(result);
  }

  owner_of(args: nameservice.owner_of_arguments): nameservice.bytes_address_object {
    const parsedName = new ParsedName(args.name);

    const res = new nameservice.bytes_address_object();

    const nameObj = this.getName(parsedName.key());

    if (nameObj) {
      res.value = nameObj.owner;
    }

    return res;
  }

  get_approved(args: nameservice.get_approved_arguments): nameservice.bytes_address_object {
    const parsedName = new ParsedName(args.name);

    const res = new nameservice.bytes_address_object();

    const approvedAddress = this.nameApprovals.get(parsedName.key());

    if (approvedAddress) {
      res.value = approvedAddress;
    }

    return res;
  }

  is_approved_for_all(args: nameservice.is_approved_for_all_arguments): nameservice.bool_object {
    return this.operatorApprovals.getApproval(args.owner, args.operator);
  }

  mint(args: nameservice.mint_arguments): nameservice.empty_object {
    const name = args.name;
    const duration_increments = args.duration_increments;
    const owner = args.owner;
    const payment_from = args.payment_from;
    const payment_token_address = args.payment_token_address;

    System.require(owner.length > 0, 'missing "owner" argument');

    // parseName will fail if name has an invalid format
    const parsedName = new ParsedName(name);
    // we use the key generated from the parsed name 
    // in case we want to add sanitization later on
    const nameKey = parsedName.key();

    // ensure TLA/Name is not minted yet
    let nameObj = this.names.get(nameKey);
    const isNewName = nameObj == null;

    // if it already exists and has not expired and the grace_period has not ended
    if (nameObj != null && (
      nameObj.expiration == 0 ||
      nameObj.expiration > this.now ||
      nameObj.grace_period_end > this.now
    )) {
      System.revert(`name "${name}" is already taken`);
    } else if (nameObj == null) {
      nameObj = new nameservice.name_object(parsedName.domain, parsedName.name);
    }

    // is the user trying to mint a TLA?
    if (nameObj.domain.length == 0) {
      // only this contract owner can mint TLAs for now
      System.requireAuthority(authority.authorization_type.contract_call, this.contractId);
      const metadata = this.metadata.get()!;

      // lock $KAP tokens
      if (metadata.tla_mint_fee > 0) {
        System.require(payment_from.length > 0, 'argument "payment_from" is missing');

        const tokenContract = new Token(metadata.kap_token_address);
        System.require(tokenContract.transfer(payment_from, this.contractId, metadata.tla_mint_fee), 'could not lock $KAP tokens');

        nameObj.locked_kap_tokens = metadata.tla_mint_fee;
      }
    } else {
      // otherwise, the user is trying to mint a name
      // get the domain
      // to get the domain object, we need to parse the domain name into a name_object
      // if the user is trying to mint "john.koin" 
      // then we need to get the domain with the name_object name: "koin" / domain: ""
      // if the user is trying to mint "john.sub.koin" 
      // then we need to get the domain for the name_object name: "sub" / domain: "koin"
      // if the user is trying to mint "john.subsub.sub.koin" 
      // then we need to get the domain for the name_object name: "subsub" / domain: "sub.koin"
      const domainObj = this.getName(nameObj.domain);

      // should not allow minting if a domain does not exist or if the domain has expired
      System.require(domainObj != null, `domain "${nameObj.domain}" does not exist`);

      // call the "authorize_mint" entrypoint of the contract hosted at "owner" address
      // this call must return the name expiration as uint64 and the grace period end as uint64
      // by default, nobody can mint a name on a domain because:
      // if there is no contract at "owner", then the system.call will fail
      // if the "authorize_mint" entrypoint is not setup  in the contract, then the system.call will fail
      // this means that "owner" has to setup a contract in order to manage its name mints
      const authorizeMintResult = this.authorizeMint(
        nameObj.name,
        nameObj.domain,
        duration_increments,
        owner,
        payment_from,
        payment_token_address,
        domainObj!.owner
      );

      nameObj.expiration = authorizeMintResult.expiration;
      nameObj.grace_period_end = authorizeMintResult.grace_period_end;

      // update domain's sub_names_count
      domainObj!.sub_names_count = SafeMath.add(domainObj!.sub_names_count, 1);
      this.names.put(nameObj.domain, domainObj!);
    }

    // if the execution reaches this line, then the TLA or name are authorized
    // so we can proceed with saving it

    // update owners index
    this.ownersIndex.updateIndex(nameKey, nameObj.owner, owner);

    // save new name
    nameObj.owner = owner;
    this.names.put(nameKey, nameObj);

    // update supply if needed
    if (isNewName) {
      const supplyObj = this.supply.get()!;
      supplyObj.value = SafeMath.add(supplyObj.value, 1);
      this.supply.put(supplyObj);
    }

    // emit event
    const mintEvent = new nameservice.mint_event(nameKey);

    System.event(
      "nameservice.mint_event",
      Protobuf.encode(mintEvent, nameservice.mint_event.encode),
      [nameObj.owner]
    );

    return new nameservice.empty_object();
  }

  transfer(args: nameservice.transfer_arguments): nameservice.empty_object {
    const name = args.name;
    const from = args.from;
    const to = args.to;

    System.require(to.length > 0, 'missing "to" argument');

    // parseName will fail if name has an invalid format
    const parsedName = new ParsedName(name);
    const nameKey = parsedName.key();

    // attempt to get name from state
    // expired names cannot be transfered
    let nameObj = this.getName(nameKey);

    System.require(nameObj != null, `name "${name}" does not exist`);

    // ensure owner is "from"
    System.require(Arrays.equal(nameObj!.owner, from), `from is not the owner of "${name}"`, error.error_code.authorization_failure);

    // check token authorizations
    let isTokenApproved: bool = false;
    // caller is either empty or a contract id
    const caller = System.getCaller().caller;

    if (!Arrays.equal(caller, from)) {
      // check if caller is approved for this name
      const approvalAddress = this.nameApprovals.get(nameKey);

      if (approvalAddress && approvalAddress.length > 0) {
        isTokenApproved = Arrays.equal(approvalAddress, caller);
      }

      if (!isTokenApproved) {
        // check if the caller is an approved operator
        const operatorApproval = this.operatorApprovals.getApproval(nameObj!.owner, caller);
        isTokenApproved = operatorApproval.value;

        if (!isTokenApproved) {
          // otherwise check authority of "from"
          isTokenApproved = System.checkAuthority(authority.authorization_type.contract_call, from);
        }
      }

      System.require(isTokenApproved, 'from has not authorized transfer', error.error_code.authorization_failure);
    }

    // remove approval
    this.nameApprovals.remove(nameKey);

    // update owners index
    this.ownersIndex.updateIndex(nameKey, nameObj!.owner, to);

    // emit event
    const transferEvent = new nameservice.transfer_event(nameKey);

    System.event(
      "nameservice.transfer_event",
      Protobuf.encode(transferEvent, nameservice.transfer_event.encode),
      [to, nameObj!.owner]
    );

    // transfer ownership
    nameObj!.owner = to;
    this.names.put(nameKey, nameObj!);

    return new nameservice.empty_object();
  }

  approve(args: nameservice.approve_arguments): nameservice.empty_object {
    const approver_address = args.approver_address;
    const to = args.to;
    const name = args.name;

    // require authority of the approver_address
    System.requireAuthority(
      authority.authorization_type.contract_call,
      approver_address
    );

    // check that the token exists
    const parsedName = new ParsedName(name);
    const nameKey = parsedName.key();
    const nameObj = this.names.get(nameKey);

    System.require(nameObj != null, 'nonexistent token');

    // check that the to is not the owner
    System.require(!Arrays.equal(nameObj!.owner, to), 'approve to current owner');

    // check that the approver_address is allowed to approve the token
    if (!Arrays.equal(nameObj!.owner, approver_address)) {
      const approval = this.operatorApprovals.getApproval(nameObj!.owner, approver_address);
      System.require(approval.value == true, 'approver_address is not owner nor approved');
    }

    // update approval
    this.nameApprovals.put(nameKey, to);

    // emit event
    const approvalEvent = new nameservice.token_approval_event(name);

    System.event(
      "nameservice.token_approval_event",
      Protobuf.encode(approvalEvent, nameservice.token_approval_event.encode),
      [to, approver_address]
    );

    return new nameservice.empty_object();
  }

  set_approval_for_all(args: nameservice.set_approval_for_all_arguments): nameservice.empty_object {
    const approver_address = args.approver_address;
    const operator_address = args.operator_address;
    const approved = args.approved;

    // only the owner of approver_address can approve an operator for his account
    System.requireAuthority(
      authority.authorization_type.contract_call,
      approver_address
    );

    // check that the approver_address is not the address to approve
    System.require(!Arrays.equal(approver_address, operator_address), 'approve to operator_address');

    // update the approval
    const approval = this.operatorApprovals.getApproval(approver_address, operator_address);
    approval.value = approved;
    this.operatorApprovals.putApproval(approver_address, operator_address, approval);

    // emit event
    const approvalEvent = new nameservice.operator_approval_event(
      approved
    );

    System.event(
      "nameservice.operator_approval_event",
      Protobuf.encode(approvalEvent, nameservice.operator_approval_event.encode),
      [operator_address, approver_address]
    );

    return new nameservice.empty_object();
  }

  // END KCS-2
  // CUSTOM FUNCTIONALITY

  burn(args: nameservice.burn_arguments): nameservice.empty_object {
    const name = args.name;

    // parseName will fail if name has an invalid format
    const parsedName = new ParsedName(name);
    const nameKey = parsedName.key();

    // attempt to get name from state
    // even expired names can be burned,
    // so get the name_object no matter what
    const nameObj = this.names.get(nameKey);

    System.require(nameObj != null, `name "${name}" does not exist`);

    // verify ownership
    const callerData = System.getCaller();

    System.require(
      Arrays.equal(callerData.caller, nameObj!.owner) ||
      System.checkAuthority(authority.authorization_type.contract_call, nameObj!.owner),
      'name owner has not authorized burn',
      error.error_code.authorization_failure
    );

    // can only burn a name if no sub_names were setup
    System.require(nameObj!.sub_names_count == 0, `name "${name}" cannot be burned because sub names exist`);

    // if TLA
    if (nameObj!.domain.length == 0) {
      // unlock $KAP tokens
      if (nameObj!.locked_kap_tokens > 0) {
        const metadata = this.metadata.get()!;
        const tokenContract = new Token(metadata.kap_token_address);

        System.require(tokenContract.transfer(this.contractId, nameObj!.owner, nameObj!.locked_kap_tokens), 'could not unlock $KAP tokens');
      }

      // remove TLA from state
      this.names.remove(nameKey);

      // update owners index
      this.ownersIndex.updateIndex(nameKey, nameObj!.owner);
    } else {
      // get domain object
      // can burn names from expired domains
      // this will always get the domain as a domain cannot be burned when it has sub names
      const domainObj = this.names.get(nameObj!.domain)!;

      // call the "authorize_burn" entrypoint of the contract hosted at "owner" address
      // if this call doesn't revert the transaction,
      // proceed with the burn
      const authorized = this.authorizeBurn(
        nameObj!,
        domainObj.owner
      );

      System.require(authorized == true, 'domain contract did not authorize burn', error.error_code.authorization_failure);

      // delete name from the state
      this.names.remove(nameKey);

      // update owners index
      this.ownersIndex.updateIndex(nameKey, nameObj!.owner);

      // update domain sub_names_count
      domainObj.sub_names_count = SafeMath.sub(domainObj.sub_names_count, 1);
      this.names.put(nameObj!.domain, domainObj);
    }

    // update supply
    const supplyObj = this.supply.get()!;
    supplyObj.value = SafeMath.sub(supplyObj.value, 1);
    this.supply.put(supplyObj);

    // emit event
    const burnEvent = new nameservice.burn_event(nameKey);

    System.event(
      "nameservice.burn_event",
      Protobuf.encode(burnEvent, nameservice.burn_event.encode),
      [nameObj!.owner]
    );

    return new nameservice.empty_object();
  }

  renew(args: nameservice.renew_arguments): nameservice.empty_object {
    const name = args.name;
    const duration_increments = args.duration_increments;
    const payment_from = args.payment_from;
    const payment_token_address = args.payment_token_address;

    // parseName will fail if name has an invalid format
    const parsedName = new ParsedName(name);
    const nameKey = parsedName.key();

    // attempt to get name from state
    // expired names must use the mint function to renew
    let nameObj = this.getName(nameKey);

    System.require(nameObj != null, `name "${name}" does not exist`);
    System.require(nameObj!.expiration != 0, `cannot renew "${name}" because it cannot expire`);

    // if TLA, revert for now
    if (nameObj!.domain.length == 0) {
      System.revert('TLAs cannot be renewed at the moment');
    } else {
      // get domain object
      // cannot renew a name on an expired domain
      const domainObj = this.getName(nameObj!.domain);

      System.require(domainObj != null, `cannot renew name "${name}" because its domain has expired`);

      // call the "authorize_renewal" entrypoint of the contract hosted at "owner" address
      // if this call doesn't revert the transaction,
      // proceed with the renewal
      const authorizeRenewalResult = this.authorizeRenewal(
        nameObj!,
        duration_increments,
        payment_from,
        payment_token_address,
        domainObj!.owner
      );

      nameObj!.expiration = authorizeRenewalResult.expiration;
      nameObj!.grace_period_end = authorizeRenewalResult.grace_period_end;
      this.names.put(nameKey, nameObj!);
    }

    return new nameservice.empty_object();
  }

  get_name(args: nameservice.get_name_arguments): nameservice.name_object {
    // parseName will fail if args.name has an invalid format
    const parsedName = new ParsedName(args.name);
    const nameKey = parsedName.key();

    // expired names don't return anything
    const nameObj = this.getName(nameKey);

    // if name exists
    if (nameObj) {
      return nameObj;
    }

    return new nameservice.name_object();
  }

  get_names(
    args: nameservice.get_names_arguments
  ): nameservice.get_names_result {
    const owner = args.owner;
    const nameOffset = args.name_offset;
    const descending = args.descending;
    let limit = args.limit || u64.MAX_VALUE;

    let nameObj: nameservice.name_object | null;
    let nameKeyHash: Uint8Array;

    // calculate offset address key if name_offset provided
    if (nameOffset.length > 0) {
      nameKeyHash = System.hash(
        Crypto.multicodec.sha2_256,
        StringBytes.stringToBytes(nameOffset)
      )!;
    } else {
      // a sha256 multihash is 34 bytes long (2 bytes for the multihash code, and 32 bytes for the digest)
      // to get the first element in the index, use a hash where all the bytes are set to 0
      // to get the last element in the index, use a hash where all the bytes are set to 255
      nameKeyHash = descending ? new Uint8Array(34).fill(u8.MAX_VALUE) : new Uint8Array(34).fill(u8.MIN_VALUE);
    }

    let ownerIndexKey = new nameservice.owner_index_key(
      owner,
      nameKeyHash
    );

    const res = new nameservice.get_names_result();

    let ownerIndexObj: system_calls.database_object | null;
    let tmpName: string;
    let tmpOwnerIndexKey: nameservice.owner_index_key;

    do {
      ownerIndexObj = descending ? this.ownersIndex.getPrev(ownerIndexKey) : this.ownersIndex.getNext(ownerIndexKey);

      if (ownerIndexObj) {
        tmpOwnerIndexKey = Protobuf.decode<nameservice.owner_index_key>(ownerIndexObj.key, nameservice.owner_index_key.decode);

        if (Arrays.equal(tmpOwnerIndexKey.owner, owner)) {
          tmpName = StringBytes.bytesToString(ownerIndexObj.value);
          nameObj = this.getName(tmpName);

          if (nameObj != null) {
            res.names.push(nameObj);
            limit--;
          }

          ownerIndexKey = tmpOwnerIndexKey;
        } else {
          break;
        }
      }

    } while (ownerIndexObj != null && limit > 0);

    return res;
  }

  set_metadata(
    args: nameservice.set_metadata_arguments
  ): nameservice.empty_object {
    // only this contract owner can set the metadata
    System.requireAuthority(authority.authorization_type.contract_call, this.contractId);

    const tla_mint_fee = args.tla_mint_fee;
    const kap_token_address = args.kap_token_address;
    const owner = args.owner;

    this.metadata.put(new nameservice.metadata_object(
      tla_mint_fee,
      kap_token_address,
      owner
    ));

    return new nameservice.empty_object();
  }

  get_metadata(
    args: nameservice.get_metadata_arguments
  ): nameservice.metadata_object {
    return this.metadata.get()!;
  }

  // PRIVATE FUNCTIONS

  /**
  * Get a name from the Names space
  * @return the name if found and it has not expired and the grace_peiod has not ended
  */
  private getName(key: string): nameservice.name_object | null {
    const nameObj = this.names.get(key);

    // if it exists and has not expired and the grace_period has not ended
    if (nameObj != null && (
      nameObj.expiration == 0 ||
      nameObj.expiration > this.now ||
      nameObj.grace_period_end > this.now
    )) {
      return nameObj;
    }

    return null;
  }

  /**
   * Call a domain contract to check if the mint of a name is allowed
   * @return the expiration date of the name
   */
  private authorizeMint(
    name: string,
    domain: string,
    durationIncrements: u32,
    owner: Uint8Array,
    paymentFrom: Uint8Array,
    paymentTokenAddress: Uint8Array,
    domainContractId: Uint8Array
  ): nameservice.authorize_mint_res {
    const authArgs = new nameservice.authorize_mint_args(
      name,
      domain,
      durationIncrements,
      owner,
      paymentFrom,
      paymentTokenAddress
    );

    const callRes = System.call(domainContractId, AUTHORIZE_MINT_ENTRYPOINT, Protobuf.encode(authArgs, nameservice.authorize_mint_args.encode));
    System.require(callRes.code == 0, 'failed to authorize mint', error.error_code.authorization_failure);
    const decodedCallRes = Protobuf.decode<nameservice.authorize_mint_res>(callRes.res.object, nameservice.authorize_mint_res.decode);

    return decodedCallRes;
  }

  /**
   * Call a domain contract to check if the burn of a name is allowed
   */
  private authorizeBurn(
    nameObj: nameservice.name_object,
    domainContractId: Uint8Array
  ): bool {
    const authArgs = new nameservice.authorize_burn_args(
      nameObj
    );

    const callRes = System.call(domainContractId, AUTHORIZE_BURN_ENTRYPOINT, Protobuf.encode(authArgs, nameservice.authorize_burn_args.encode));
    System.require(callRes.code == 0, 'failed to authorize burn', error.error_code.authorization_failure);
    const decodedCallRes = Protobuf.decode<nameservice.authorize_burn_res>(callRes.res.object, nameservice.authorize_burn_res.decode);

    return decodedCallRes.authorized;
  }

  /**
   * Call a domain contract to check if the renewal of a name is allowed
   * @return the new expiration date of the name
   */
  private authorizeRenewal(
    nameObj: nameservice.name_object,
    durationIncrements: u32,
    paymentFrom: Uint8Array,
    paymentTokenAddress: Uint8Array,
    domainContractId: Uint8Array
  ): nameservice.authorize_renewal_res {
    const authArgs = new nameservice.authorize_renewal_args(
      nameObj,
      durationIncrements,
      paymentFrom,
      paymentTokenAddress
    );

    const callRes = System.call(domainContractId, AUTHORIZE_RENEWAL_ENTRYPOINT, Protobuf.encode(authArgs, nameservice.authorize_renewal_args.encode));
    System.require(callRes.code == 0, 'failed to authorize reclaim', error.error_code.authorization_failure);
    const decodedCallRes = Protobuf.decode<nameservice.authorize_renewal_res>(callRes.res.object, nameservice.authorize_renewal_res.decode);

    return decodedCallRes;
  }
}
