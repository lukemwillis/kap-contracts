import { System, Protobuf, authority } from "@koinos/sdk-as";
import { koindomain } from "./proto/koindomain";

export class Koindomain {
  authorize_registration(
    args: koindomain.authorize_registration_arguments
  ): koindomain.authorize_registration_result {
    // const name = args.name;
    // const domain = args.domain;
    // const duration_increments = args.duration_increments;
    // const owner = args.owner;
    // const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;

    // YOUR CODE HERE

    const res = new koindomain.authorize_registration_result();
    // res.value = ;

    return res;
  }
}
