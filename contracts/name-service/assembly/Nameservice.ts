import { authority, Protobuf, System, Token } from "@koinos/sdk-as";
import { AUTHORIZE_REGISTRATION_ENTRYPOINT } from "./Constants";
import { nameservice } from "./proto/nameservice";
import { Metadata } from "./state/Metadata";
import { Names } from "./state/Names";

export class Nameservice {
  contractId: Uint8Array = System.getContractId();

  /**
    * Validate a name or domain
    */
  validateElement(element: string): void {
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
  parseName(name: string): nameservice.name_object {
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

  register(args: nameservice.register_arguments): nameservice.empty_object {
    System.require(args.owner.length > 0, 'missing "owner" argument');

    // parseName will fail if args.name has an invalid format
    const nameObj = this.parseName(args.name);

    const names = new Names(this.contractId);

    // ensure name is not registered yet
    System.require(names.get(nameObj) == null, `name "${args.name}" is already taken`);

    // is the user trying to register a TLA?
    if (nameObj.domain.length == 0) {
      // only this contract can register TLAs for now
      System.requireAuthority(authority.authorization_type.contract_call, this.contractId);
      const metadata = new Metadata(this.contractId).get()!;

      // burn KAP tokens
      if (metadata.tla_registration_fee > 0) {
        const tokenContract = new Token(metadata.kap_token_address);
        System.require(tokenContract.burn(this.contractId, metadata.tla_registration_fee), 'could not burn KAP tokens');
      }
    } else {
      // otherwise, the user is trying to register a name
      // get the domain
      // to get the domain object, we need to parse the domain name into a name_object
      // if the user is trying to register "john.koin" 
      // then we need to get the domain with the name_object name: "koin" / domain: ""
      // if the user is trying to register "john.sub.koin" 
      // then we need to get the domain for the name_object name: "sub" / domain: "koin"
      // if the user is trying to register "john.subsub.sub.koin" 
      // then we need to get the domain for the name_object name: "subsub" / domain: "sub.koin"
      const domainNameObj = this.parseName(nameObj.domain);
      const domainObj = names.get(domainNameObj);

      System.require(domainObj != null, `domain "${nameObj.domain}" does not exist`);
    
      // call the "autorize_registration" entrypoint of the contract hosted at "owner" address
      // this call must return the name expiration as uint64
      // by default, nobody can register a name on a domain because:
      // if there is no contract at "owner", then the system.call will fail
      // if the "autorize_registration" entrypoint is not setup  in the contract, then the system.call will fail
      // this means that "owner" has to setup a contract in order to manage its name registrations
      const authArgs = new nameservice.authorize_registration_args(
        nameObj.name,
        nameObj.domain,
        args.duration_increments,
        args.owner,
        args.payment_from,
        args.payment_token_address
      );
      const callRes = System.call(nameObj.owner, AUTHORIZE_REGISTRATION_ENTRYPOINT, Protobuf.encode(authArgs, nameservice.authorize_registration_args.encode));
      System.require(callRes.code == 0, 'failed to authorize registration');
      const expiration = Protobuf.decode<nameservice.authorize_registration_res>(callRes.res.object, nameservice.authorize_registration_res.decode);

      nameObj.expiration = expiration.value;
    }

    // if the execution reaches this line, then the TLA or name are authorized
    // so we can proceed with saving it

    // save new name
    nameObj.owner = args.owner;
    names.put(new nameservice.name_object(nameObj.domain, nameObj.name), nameObj);

    return new nameservice.empty_object();
  }

  get_metadata(
    args: nameservice.get_metadata_arguments
  ): nameservice.metadata_object {
    const metadata = new Metadata(this.contractId);

    return metadata.get()!;
  }
}
