import { Arrays, authority, Protobuf, SafeMath, System, Token } from "@koinos/sdk-as";
import { MILLISECONDS_PER_DAY } from "./Constants";
import { nameservice } from "./proto/nameservice";
import { Metadata } from "./state/Metadata";
import { Names } from "./state/Names";

export class Nameservice {
  contractId: Uint8Array = System.getContractId();

  /**
    * Get the USD price of a token from the oracle contract
    */
  getUSDPrice(tokenAddress: Uint8Array): u64 {
    const args = new nameservice.get_usd_price_args(tokenAddress);
    const metadata = new Metadata(this.contractId).get()!;

    const callRes = System.call(metadata.oracle_address, 0x1, Protobuf.encode(args, nameservice.get_usd_price_args.encode));
    System.require(callRes.code == 0, "failed to retrieve USD price");
    const res = Protobuf.decode<nameservice.get_usd_price_res>(callRes.res.object, nameservice.get_usd_price_res.decode);

    return res.value;
  }

  /**
    * Validate a name or domain
    */
  validateElement(element: string): void {
    System.require(element.length > 0, 'an element cannot be empty');
    System.require(element.at(0) != '-', `element "${element}" cannot start with an hyphen (-)`);
    System.require(element.at(element.length - 1) != '-', `element "${element}" cannot end with an hyphen (-)`);

    let prevChar = '';
    for (let index = 0; index < element.length; index++) {
      const char = element.at(index);
      if (prevChar == '-' && char == '-') {
        System.revert(`element "${element}" cannot have consecutive hyphens (-)`);
      }
      prevChar = char;
    }
  }

  /**
    * Parse a string name into a name_object
    * e.g.: "name.domain" => obj.name = "name" and obj.domain = "domain"
    * e.g.: "name.subdomain.domain" => obj.name = "name" and obj.domain = "subdomain.domain"
   */
  parseName(name: string): nameservice.name_object {
    const splittedNameArr = name.toLowerCase().split('.');

    // validate each element composing the name
    for (let index = 0; index < splittedNameArr.length; index++) {
      const element = splittedNameArr[index];
      this.validateElement(element);
    }

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
      // get the domain's rules
      // to get the domain object, we need to parse the domain name into a name_object
      // if the user is trying to register "john.koin" 
      // then the we need to get the rules for the name_object name: "koin" / domain: ""
      // if the user is trying to register "john.sub.koin" 
      // then the we need to get the rules for the name_object name: "john" / domain: "sub.koin"
      const domainNameObj = this.parseName(nameObj.domain);
      const domainObj = names.get(domainNameObj);

      System.require(domainObj != null, `domain "${nameObj.domain}" does not exist`);
      System.require(domainObj!.rules != null && domainObj!.rules!.is_mintable, `domain "${nameObj.domain}" is not setup for registration`);

      // process payment if payment tokens and pricings are setup
      if (domainNameObj.rules!.allowed_payment_tokens.length > 0
        && domainObj!.rules!.pricings.length > 0) {
        // find the correct pricing
        const nameLength = nameObj.name.length as u32;
        let pricePerIncrement: u64 = 0;
        for (let index = 0; index < domainObj!.rules!.pricings.length; index++) {
          const pricing = domainObj!.rules!.pricings[index];
          if (nameLength >= pricing.number_characters_from
            && nameLength <= pricing.number_characters_to) {
            pricePerIncrement = pricing.price_per_increment;
            break;
          }
        }

        const totalUSDPrice = SafeMath.mul(pricePerIncrement, args.duration_increments);

        if (totalUSDPrice > 0) {
          // check if payment token address is allowed
          let foundPaymentToken = false;
          for (let index = 0; index < domainObj!.rules!.allowed_payment_tokens.length; index++) {
            const paymentToken = domainObj!.rules!.allowed_payment_tokens[index];

            if (Arrays.equal(args.payment_token_address, paymentToken)) {
              foundPaymentToken = true;
            }
          }

          System.require(foundPaymentToken == true, 'the payment token address provided is not supported');

          // get number of tokens to transfer
          const paymentTokenUSDPrice = this.getUSDPrice(args.payment_token_address);
          const numberOfTokensToTransfer = SafeMath.div(totalUSDPrice, paymentTokenUSDPrice);

          // transfer tokens to domain owner
          const tokenContract = new Token(args.payment_token_address);
          System.require(tokenContract.transfer(args.payment_from, domainObj!.owner, numberOfTokensToTransfer), 'could not transfer payment tokens to domain owner');
        }
      }

      // set expiration
      const now = System.getHeadInfo().head_block_time;
      const expirationInDays = SafeMath.mul(args.duration_increments, domainObj!.rules!.days_per_increment);
      const expirationInMs = SafeMath.mul(expirationInDays, MILLISECONDS_PER_DAY);

      nameObj.expiration = SafeMath.add(now, expirationInMs);
    }

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
