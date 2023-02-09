import { Arrays, authority, Crypto, error, Protobuf, SafeMath, System, Token } from "@koinos/sdk-as";
import { AUTHORIZE_MINT_ENTRYPOINT, AUTHORIZE_RENEWAL_ENTRYPOINT, AUTHORIZE_BURN_ENTRYPOINT } from "./Constants";
import { nameservice } from "./proto/nameservice";
import { OwnersIndex } from "./state/OwnersIndex";
import { Metadata } from "./state/Metadata";
import { Names } from "./state/Names";

export class Nameservice {
  contractId: Uint8Array = System.getContractId();
  names: Names = new Names(this.contractId);
  ownersIndex: OwnersIndex = new OwnersIndex(this.contractId);
  now: u64 = System.getHeadInfo().head_block_time;

  /**
    * Validate a name or domain
    */
  private validateElement(element: string): void {
    System.require(element.length > 0, 'an element cannot be empty');
    System.require(!element.startsWith('-'), `element "${element}" cannot start with an hyphen (-)`);
    System.require(!element.endsWith('-'), `element "${element}" cannot end with an hyphen (-)`);
    System.require(!element.includes('--'), `element "${element}" cannot have consecutive hyphens (-)`);
  }

  /**
    * Parse a string name into a name_object
    * e.g.: "name.domain" => obj.name = "name" and obj.domain = "domain"
    * e.g.: "name.subdomain.domain" => obj.name = "name" and obj.domain = "subdomain.domain"
   */
  private parseName(name: string): nameservice.name_object {
    const splittedNameArr = name.toLowerCase().split('.');

    // validate first element only 
    // everything after the first "." would have been previously validated
    this.validateElement(splittedNameArr[0]);

    const nameObject = new nameservice.name_object();

    // the first element of splittedNameArr is either a name or a TLA
    nameObject.name = splittedNameArr.shift();

    // if splittedNameArr has 2 or more elements, that means a domain was provided 
    // otherwise it's a TLA, so keep the domain empty
    if (splittedNameArr.length >= 1) {
      // group the domain elements back with a '.'
      nameObject.domain = splittedNameArr.join('.');
    }

    return nameObject;
  }

  /**
   * Call a domain contract to check if the mint of a name is allowed
   * @return the expiration date of the name
   */
  private autorizeMint(
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
    System.require(callRes.code == 0, 'failed to authorize mint');
    const decodedCallRes = Protobuf.decode<nameservice.authorize_mint_res>(callRes.res.object, nameservice.authorize_mint_res.decode);

    return decodedCallRes;
  }

  /**
   * Call a domain contract to check if the burn of a name is allowed
   */
  private autorizeBurn(
    nameObj: nameservice.name_object,
    domainContractId: Uint8Array
  ): bool {
    const authArgs = new nameservice.authorize_burn_args(
      nameObj
    );

    const callRes = System.call(domainContractId, AUTHORIZE_BURN_ENTRYPOINT, Protobuf.encode(authArgs, nameservice.authorize_burn_args.encode));
    System.require(callRes.code == 0, 'failed to authorize burn');
    const decodedCallRes = Protobuf.decode<nameservice.authorize_burn_res>(callRes.res.object, nameservice.authorize_burn_res.decode);

    return decodedCallRes.authorized;
  }

  /**
   * Call a domain contract to check if the renewal of a name is allowed
   * @return the new expiration date of the name
   */
  private autorizeRenewal(
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
    System.require(callRes.code == 0, 'failed to authorize reclaim');
    const decodedCallRes = Protobuf.decode<nameservice.authorize_renewal_res>(callRes.res.object, nameservice.authorize_renewal_res.decode);

    return decodedCallRes;
  }

  /**
  * Get a name from the Names space
  * @return the name if found and it has not expired and the grace_peiod has not ended
  */
  getName(key: nameservice.name_object): nameservice.name_object | null {
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

  mint(args: nameservice.mint_arguments): nameservice.empty_object {
    const name = args.name;
    const duration_increments = args.duration_increments;
    const owner = args.owner;
    const payment_from = args.payment_from;
    const payment_token_address = args.payment_token_address;

    System.require(owner.length > 0, 'missing "owner" argument');

    // parseName will fail if name has an invalid format
    const nameKey = this.parseName(name);

    // ensure TLA/Name is not minted yet
    let nameObj = this.names.get(nameKey);

    // if it already exists and has not expired and the grace_period has not ended
    if (nameObj != null && (
      nameObj.expiration == 0 ||
      nameObj.expiration > this.now ||
      nameObj.grace_period_end > this.now
    )) {
      System.revert(`name "${name}" is already taken`);
    } else if (nameObj == null) {
      nameObj = new nameservice.name_object(nameKey.domain, nameKey.name);
    }

    // is the user trying to mint a TLA?
    if (nameObj.domain.length == 0) {
      // only this contract can mint TLAs for now
      System.requireAuthority(authority.authorization_type.contract_call, this.contractId);
      const metadata = new Metadata(this.contractId).get()!;

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
      const domainKey = this.parseName(nameObj.domain);
      const domainObj = this.getName(domainKey);

      // should not allow minting if a domain does not exist or if the domain has expired
      System.require(domainObj != null, `domain "${nameObj.domain}" does not exist`);

      // call the "autorize_mint" entrypoint of the contract hosted at "owner" address
      // this call must return the name expiration as uint64 and the grace period end as uint64
      // by default, nobody can mint a name on a domain because:
      // if there is no contract at "owner", then the system.call will fail
      // if the "autorize_mint" entrypoint is not setup  in the contract, then the system.call will fail
      // this means that "owner" has to setup a contract in order to manage its name mints
      const autorizeMintResult = this.autorizeMint(
        nameObj.name,
        nameObj.domain,
        duration_increments,
        owner,
        payment_from,
        payment_token_address,
        domainObj!.owner
      );

      nameObj.expiration = autorizeMintResult.expiration;
      nameObj.grace_period_end = autorizeMintResult.grace_period_end;

      // update domain's sub_names_count
      domainObj!.sub_names_count = SafeMath.add(domainObj!.sub_names_count, 1);
      this.names.put(domainKey, domainObj!);
    }

    // if the execution reaches this line, then the TLA or name are authorized
    // so we can proceed with saving it

    // update owners index
    this.ownersIndex.updateIndex(nameKey, nameObj.owner, owner);

    // save new name
    nameObj.owner = owner;
    this.names.put(nameKey, nameObj);

    return new nameservice.empty_object();
  }

  burn(args: nameservice.burn_arguments): nameservice.empty_object {
    const name = args.name;

    // parseName will fail if name has an invalid format
    const nameKey = this.parseName(name);

    // attempt to get name from state
    // even expired names can be burned,
    // so get the name_object no matter what
    const nameObj = this.names.get(nameKey);

    if (nameObj == null) {
      System.revert(`name "${name}" does not exist`);
    }

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
        const metadata = new Metadata(this.contractId).get()!;
        const tokenContract = new Token(metadata.kap_token_address);

        System.require(tokenContract.transfer(this.contractId, nameObj!.owner, nameObj!.locked_kap_tokens), 'could not unlock $KAP tokens');
      }

      // remove TLA from state
      this.names.remove(nameKey);

      // update owners index
      this.ownersIndex.updateIndex(nameKey, nameObj!.owner);
    } else {
      // get domain object
      const domainKey = this.parseName(nameKey.domain);
      // can burn names from expired domains
      const domainObj = this.names.get(domainKey)!;

      // call the "autorize_burn" entrypoint of the contract hosted at "owner" address
      // if this call doesn't revert the transaction,
      // proceed with the burn
      const authorized = this.autorizeBurn(
        nameObj!,
        domainObj.owner
      );

      if (authorized) {
        // delete name from the state
        this.names.remove(nameKey);

        // update owners index
        this.ownersIndex.updateIndex(nameKey, nameObj!.owner);

        // update domain sub_names_count
        domainObj.sub_names_count = SafeMath.sub(domainObj.sub_names_count, 1);
        this.names.put(domainKey, domainObj);
      }
    }

    return new nameservice.empty_object();
  }

  transfer(args: nameservice.transfer_arguments): nameservice.empty_object {
    const name = args.name;
    const to = args.to;
    System.require(to.length > 0, 'missing "to" argument');

    // parseName will fail if name has an invalid format
    const nameKey = this.parseName(name);

    // attempt to get name from state
    // expired names cannot be transfered
    let nameObj = this.getName(nameKey);

    System.require(nameObj != null, `name "${name}" does not exist`);

    // verify ownership
    const callerData = System.getCaller();
    System.require(
      Arrays.equal(callerData.caller, nameObj!.owner) ||
      System.checkAuthority(authority.authorization_type.contract_call, nameObj!.owner),
      'name owner has not authorized transfer',
      error.error_code.authorization_failure
    );

    // update owners index
    this.ownersIndex.updateIndex(nameKey, nameObj!.owner, to);

    // transfer ownership
    nameObj!.owner = to;
    this.names.put(nameKey, nameObj!);

    return new nameservice.empty_object();
  }

  renew(args: nameservice.renew_arguments): nameservice.empty_object {
    const name = args.name;
    const duration_increments = args.duration_increments;
    const payment_from = args.payment_from;
    const payment_token_address = args.payment_token_address;

    // parseName will fail if name has an invalid format
    const nameKey = this.parseName(name);

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
      const domainKey = this.parseName(nameKey.domain);

      // cannot renew a name on an expired domain
      const domainObj = this.getName(domainKey);

      // call the "autorize_renewal" entrypoint of the contract hosted at "owner" address
      // if this call doesn't revert the transaction,
      // proceed with the renewal
      const autorizeRenewalResult = this.autorizeRenewal(
        nameObj!,
        duration_increments,
        payment_from,
        payment_token_address,
        domainObj!.owner
      );

      nameObj!.expiration = autorizeRenewalResult.expiration;
      nameObj!.grace_period_end = autorizeRenewalResult.grace_period_end;
      this.names.put(nameKey, nameObj!);
    }

    return new nameservice.empty_object();
  }

  get_name(args: nameservice.get_name_arguments): nameservice.name_object {
    // parseName will fail if args.name has an invalid format
    const nameKey = this.parseName(args.name);

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
    let limit = args.limit || 10;

    let nameObj: nameservice.name_object | null;
    let nameKeyHash: Uint8Array;

    // calculate offset address key if name_offset provided
    if (nameOffset.length > 0) {
      const nameOffsetKey = this.parseName(nameOffset);
      nameObj = new nameservice.name_object(nameOffsetKey.domain, nameOffsetKey.name);
      nameKeyHash = System.hash(
        Crypto.multicodec.sha2_256,
        Protobuf.encode(nameObj, nameservice.name_object.encode)
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

    let done = false;
    let ownerIndexObj: System.ProtoDatabaseObject<nameservice.name_object> | null;
    let tmpOwnerIndexKey: nameservice.owner_index_key;

    do {
      ownerIndexObj = descending ? this.ownersIndex.getPrev(ownerIndexKey) : this.ownersIndex.getNext(ownerIndexKey);

      if (ownerIndexObj) {
        tmpOwnerIndexKey = Protobuf.decode<nameservice.owner_index_key>(ownerIndexObj.key!, nameservice.owner_index_key.decode);

        if (Arrays.equal(tmpOwnerIndexKey.owner, owner)) {
          nameObj = this.getName(ownerIndexObj.value);

          if (nameObj != null) {
            res.names.push(nameObj);
            limit--;
          }

          ownerIndexKey = tmpOwnerIndexKey;
        } else {
          done = true;
        }
      } else {
        done = true;
      }

    } while (!done && limit > 0);

    return res;
  }

  set_metadata(
    args: nameservice.set_metadata_arguments
  ): nameservice.empty_object {
    // only this contract can set the meatadata for now
    System.requireAuthority(authority.authorization_type.contract_call, this.contractId);

    const tla_mint_fee = args.tla_mint_fee;
    const kap_token_address = args.kap_token_address;

    const metadata = new Metadata(this.contractId);
    metadata.put(new nameservice.metadata_object(
      tla_mint_fee,
      kap_token_address
    ));

    return new nameservice.empty_object();
  }

  get_metadata(
    args: nameservice.get_metadata_arguments
  ): nameservice.metadata_object {
    const metadata = new Metadata(this.contractId);

    return metadata.get()!;
  }
}
