import { System, Protobuf, authority } from "@koinos/sdk-as";
import { nameservice } from "./proto/nameservice";

export class Nameservice {
  register(args: nameservice.register_arguments): nameservice.empty_object {
    // const name = args.name;
    // const duration_increments = args.duration_increments;
    // const owner = args.owner;
    // const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  get_metadata(
    args: nameservice.get_metadata_arguments
  ): nameservice.metadata_object {
    // YOUR CODE HERE

    const res = new nameservice.metadata_object();
    // res.tla_registration_fee = ;
    // res.kap_token_address = ;

    return res;
  }
}
