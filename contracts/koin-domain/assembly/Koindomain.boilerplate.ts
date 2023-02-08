import { System, Protobuf, authority } from "@koinos/sdk-as";
import { koindomain } from "./proto/koindomain";

export class Koindomain {
  authorize_mint(
    args: koindomain.authorize_mint_arguments
  ): koindomain.authorize_mint_result {
    // const name = args.name;
    // const domain = args.domain;
    // const duration_increments = args.duration_increments;
    // const owner = args.owner;
    // const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;

    // YOUR CODE HERE

    const res = new koindomain.authorize_mint_result();
    // res.expiration = ;
    // res.grace_period_end = ;

    return res;
  }
}
