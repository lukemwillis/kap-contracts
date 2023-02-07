import { System, SafeMath, Arrays } from "@koinos/sdk-as";
import { koindomain } from "./proto/koindomain";

export class Koindomain {
  authorize_registration(
    args: koindomain.authorize_registration_arguments
  ): koindomain.authorize_registration_result {
    // const name = args.name;
    // const domain = args.domain;
    // const duration_increments = args.duration_increments;
    // const owner = args.owner;
    const payment_from = args.payment_from;
    const payment_token_address = args.payment_token_address;

    // handle payment
    System.require(payment_from.length > 0, 'argument "payment_from" is missing');

    const koinAddress = System.getContractAddress('koin');
    System.require(Arrays.equal(payment_token_address, koinAddress), 'only Koin payments are supported at the moment');
    
    // handle expiration
    const DAYS_PER_INCREMENT = 365;
    const MILLISECONDS_PER_DAY: u64 = 86400000; 

    const now = System.getHeadInfo().head_block_time;
    const expirationInDays = SafeMath.mul(args.duration_increments, DAYS_PER_INCREMENT);
    const expirationInMs = SafeMath.mul(expirationInDays, MILLISECONDS_PER_DAY);

    return new koindomain.authorize_registration_result(SafeMath.add(now, expirationInMs));
  }
}
