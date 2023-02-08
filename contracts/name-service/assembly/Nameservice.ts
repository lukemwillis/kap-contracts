import { Arrays, authority, Crypto, error, Protobuf, SafeMath, System, Token } from "@koinos/sdk-as";
import { AUTHORIZE_RECLAIM_ENTRYPOINT, AUTHORIZE_MINT_ENTRYPOINT, AUTHORIZE_RENEWAL_ENTRYPOINT, AUTHORIZE_BURN_ENTRYPOINT } from "./Constants";
import { nameservice } from "./proto/nameservice";
import { Addresses } from "./state/Addresses";
import { Metadata } from "./state/Metadata";
import { Names } from "./state/Names";

export class Nameservice {
  contractId: Uint8Array = System.getContractId();

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
  ): u64 {
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
    return decodedCallRes.expiration;
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
  ): u64 {
    const authArgs = new nameservice.authorize_renewal_args(
      nameObj,
      durationIncrements,
      paymentFrom,
      paymentTokenAddress
    );

    const callRes = System.call(domainContractId, AUTHORIZE_RENEWAL_ENTRYPOINT, Protobuf.encode(authArgs, nameservice.authorize_renewal_args.encode));
    System.require(callRes.code == 0, 'failed to authorize reclaim');
    const decodedCallRes = Protobuf.decode<nameservice.authorize_renewal_res>(callRes.res.object, nameservice.authorize_renewal_res.decode);
    return decodedCallRes.expiration;
  }

  /**
   * Call a domain contract to check if the reclaim of a name is allowed
   */
  private autorizeReclaim(
    nameObj: nameservice.name_object,
    domainContractId: Uint8Array
  ): bool {
    const authArgs = new nameservice.authorize_reclaim_args(
      nameObj
    );

    const callRes = System.call(domainContractId, AUTHORIZE_RECLAIM_ENTRYPOINT, Protobuf.encode(authArgs, nameservice.authorize_reclaim_args.encode));
    System.require(callRes.code == 0, 'failed to authorize reclaim');
    const decodedCallRes = Protobuf.decode<nameservice.authorize_reclaim_res>(callRes.res.object, nameservice.authorize_reclaim_res.decode);
    return decodedCallRes.authorized;
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

    // attempt to get name from state
    const names = new Names(this.contractId);
    let nameObj = names.get(nameKey);

    // is the user trying to mint a TLA?
    if (nameKey.domain.length == 0) {
      // ensure TLA is not minted yet
      System.require(nameObj == null, `name "${name}" is already taken`);
      nameObj = new nameservice.name_object('', nameKey.name);

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
      const domainKey = this.parseName(nameKey.domain);
      const domainObj = names.get(domainKey);

      System.require(domainObj != null, `domain "${nameKey.domain}" does not exist`);

      // if name is already taken, check expiration and/or if it can be reclaimed
      if (nameObj != null) {
        // check expiration
        const now = System.getHeadInfo().head_block_time;

        if (nameObj.expiration == 0 || nameObj.expiration > now) {
          System.revert(`name "${name}" is already taken`);
        } else {
          // otherwise, it is expired, so check reclaim
          // call the "autorize_reclaim" entrypoint of the contract hosted at "owner" address
          // if this call doesn't revert the transaction and return true,
          // proceed with the mint
          const authorized = this.autorizeReclaim(
            nameObj,
            domainObj!.owner
          );

          if (!authorized) {
            System.revert(`cannot reclaim name "${name}"`);
          }
        }
      } else {
        nameObj = new nameservice.name_object(nameKey.domain, nameKey.name);
      }

      // call the "autorize_mint" entrypoint of the contract hosted at "owner" address
      // this call must return the name expiration as uint64
      // by default, nobody can mint a name on a domain because:
      // if there is no contract at "owner", then the system.call will fail
      // if the "autorize_mint" entrypoint is not setup  in the contract, then the system.call will fail
      // this means that "owner" has to setup a contract in order to manage its name mints
      const expiration = this.autorizeMint(
        nameKey.name,
        nameKey.domain,
        duration_increments,
        owner,
        payment_from,
        payment_token_address,
        domainObj!.owner
      );

      nameObj.expiration = expiration;

      // update domain's sub_names_count
      domainObj!.sub_names_count = SafeMath.add(domainObj!.sub_names_count, 1);
      names.put(domainKey, domainObj!);
    }

    // if the execution reaches this line, then the TLA or name are authorized
    // so we can proceed with saving it

    // update addresses index
    const addresses = new Addresses(this.contractId);

    const nameKeyHash = System.hash(
      Crypto.multicodec.sha2_256,
      Protobuf.encode(nameKey, nameservice.name_object.encode)
    );

    // remove old record
    let addressKey = new nameservice.address_key(nameObj.owner, nameKeyHash!);
    addresses.remove(addressKey);

    // save new name
    nameObj.owner = owner;
    names.put(nameKey, nameObj);

    // add new record
    addressKey = new nameservice.address_key(owner, nameKeyHash!);
    addresses.put(addressKey, nameKey);

    return new nameservice.empty_object();
  }

  burn(args: nameservice.burn_arguments): nameservice.empty_object {
    const name = args.name;

    // parseName will fail if name has an invalid format
    const nameKey = this.parseName(name);

    // attempt to get name from state
    const names = new Names(this.contractId);
    let nameObj = names.get(nameKey);

    if (nameObj == null) {
      System.revert(`name "${name}" does not exist`);
    }

    // verify ownership
    const callerData = System.getCaller();

    // calculate nameKey hash
    const addresses = new Addresses(this.contractId);
    const nameKeyHash = System.hash(
      Crypto.multicodec.sha2_256,
      Protobuf.encode(nameKey, nameservice.name_object.encode)
    );
    const addressKey = new nameservice.address_key(nameObj!.owner, nameKeyHash!);

    System.require(
      callerData.caller == nameObj!.owner
      || System.checkAuthority(authority.authorization_type.contract_call, nameObj!.owner),
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
      names.remove(nameKey);

      // delete name from addresses
      addresses.remove(addressKey);
    } else {
      // get domain object
      const domainKey = this.parseName(nameKey.domain);
      const domainObj = names.get(domainKey)!;

      // call the "autorize_burn" entrypoint of the contract hosted at "owner" address
      // if this call doesn't revert the transaction,
      // proceed with the burn
      const authorized = this.autorizeBurn(
        nameObj!,
        domainObj.owner
      );

      if (authorized) {
        // delete name from the state
        names.remove(nameKey);

        // delete name from addresses
        addresses.remove(addressKey);

        // update domain sub_names_count
        domainObj.sub_names_count = SafeMath.sub(domainObj.sub_names_count, 1);
        names.put(domainKey, domainObj);
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
    const names = new Names(this.contractId);
    let nameObj = names.get(nameKey);

    if (nameObj == null) {
      System.revert(`name "${name}" does not exist`);
    }

    // verify ownership
    const callerData = System.getCaller();
    System.require(
      callerData.caller == nameObj!.owner
      || System.checkAuthority(authority.authorization_type.contract_call, nameObj!.owner),
      'name owner has not authorized transfer',
      error.error_code.authorization_failure
    );

    // calculate nameKey hash
    const addresses = new Addresses(this.contractId);
    const nameKeyHash = System.hash(
      Crypto.multicodec.sha2_256,
      Protobuf.encode(nameKey, nameservice.name_object.encode)
    );

    // remove old address record
    let addressKey = new nameservice.address_key(nameObj!.owner, nameKeyHash!);
    addresses.remove(addressKey);

    // transfer ownership
    nameObj!.owner = to;
    names.put(nameKey, nameObj!);

    // add new address record
    addressKey = new nameservice.address_key(nameObj!.owner, nameKeyHash!);
    addresses.put(addressKey, nameKey);

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
    const names = new Names(this.contractId);
    let nameObj = names.get(nameKey);

    if (nameObj == null) {
      System.revert(`name "${name}" does not exist`);
    }

    if (nameObj!.domain.length == 0) {
      System.revert('TLAs cannot be renewed at the moment');
    }

    // get domain object
    const domainKey = this.parseName(nameKey.domain);
    const domainObj = names.get(domainKey)!;

    // call the "autorize_renewal" entrypoint of the contract hosted at "owner" address
    // if this call doesn't revert the transaction,
    // proceed with the renewal
    const expiration = this.autorizeRenewal(
      nameObj!,
      duration_increments,
      payment_from,
      payment_token_address,
      domainObj.owner
    );

    nameObj!.expiration = expiration;
    names.put(nameKey, nameObj!);

    return new nameservice.empty_object();
  }

  get_name(args: nameservice.get_name_arguments): nameservice.get_name_result {
    // parseName will fail if args.name has an invalid format
    const nameKey = this.parseName(args.name);

    const names = new Names(this.contractId);
    const nameObj = names.get(nameKey);

    // if name exists
    if (nameObj) {
      // check expiration
      const now = System.getHeadInfo().head_block_time;

      const result = new nameservice.get_name_result(
        nameObj.domain,
        nameObj.name,
        nameObj.owner,
        nameObj.expiration,
        nameObj.sub_names_count,
        nameObj.locked_kap_tokens
      );

      // if expired
      if (nameObj.expiration != 0 && nameObj.expiration <= now) {
        result.has_expired = true;

        // call the "autorize_reclaim" entrypoint of the contract hosted at "owner" address
        // if this call doesn't revert the transaction and return true,
        const domainKey = this.parseName(nameKey.domain);
        const domainObj = names.get(domainKey);

        result.can_be_reclaimed = this.autorizeReclaim(
          nameObj,
          domainObj!.owner
        );

        // if the name can be reclaimed
        // it means that the name has expired and the grace period has ended
        if (result.can_be_reclaimed) {
          result.owner = new Uint8Array(0);
        }
      }

      return result;
    }

    return new nameservice.get_name_result();
  }

  get_names(
    args: nameservice.get_names_arguments
  ): nameservice.get_names_result {
    const owner = args.owner;

    const names = new Names(this.contractId);
    const addresses = new Addresses(this.contractId);
    let addressKey = new nameservice.address_key(
      owner,
      new Uint8Array(32).fill(0)
    );

    const res = new nameservice.get_names_result();

    let done = false;
    let addressObj: System.ProtoDatabaseObject<nameservice.name_object> | null;
    let tmpAddressKey: nameservice.address_key;
    let nameObj: nameservice.name_object;
    let nameResult: nameservice.get_name_result;
    let domainKey: nameservice.name_object;
    let domainObj: nameservice.name_object;

    const now = System.getHeadInfo().head_block_time;

    do {
      addressObj = addresses.getNext(addressKey);

      if (addressObj) {
        tmpAddressKey = Protobuf.decode<nameservice.address_key>(addressObj.key!, nameservice.address_key.decode);

        if (Arrays.equal(tmpAddressKey.owner, owner)) {
          nameObj = names.get(addressObj.value)!;

          // check expiration
          nameResult = new nameservice.get_name_result(
            nameObj.domain,
            nameObj.name,
            nameObj.owner,
            nameObj.expiration,
            nameObj.sub_names_count,
            nameObj.locked_kap_tokens
          );

          // if expired
          if (nameObj.expiration != 0 && nameObj.expiration <= now) {
            nameResult.has_expired = true;

            // call the "autorize_reclaim" entrypoint of the contract hosted at "owner" address
            // if this call doesn't revert the transaction and return true,
            domainKey = this.parseName(nameObj.domain);
            domainObj = names.get(domainKey)!;

            nameResult.can_be_reclaimed = this.autorizeReclaim(
              nameObj,
              domainObj.owner
            );

            // if the name cannot be reclaimed
            // it means that the name has expired, but the grace period has not ended
            if (!nameResult.can_be_reclaimed) {
              res.names.push(nameResult);
            }
          } else {
            res.names.push(nameResult);
          }

          addressKey = tmpAddressKey;
        } else {
          done = true;
        }
      } else {
        done = true;
      }

    } while (!done);

    return res;
  }

  get_metadata(
    args: nameservice.get_metadata_arguments
  ): nameservice.metadata_object {
    const metadata = new Metadata(this.contractId);

    return metadata.get()!;
  }
}
