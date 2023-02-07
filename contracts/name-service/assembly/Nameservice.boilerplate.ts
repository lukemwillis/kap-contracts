import { System, Protobuf, authority } from "@koinos/sdk-as";
import { nameservice } from "./proto/nameservice";

export class Nameservice {
  mint(args: nameservice.mint_arguments): nameservice.empty_object {
    // const name = args.name;
    // const duration_increments = args.duration_increments;
    // const owner = args.owner;
    // const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  burn(args: nameservice.burn_arguments): nameservice.empty_object {
    // const name = args.name;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  transfer(args: nameservice.transfer_arguments): nameservice.empty_object {
    // const name = args.name;
    // const to = args.to;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  renew(args: nameservice.renew_arguments): nameservice.empty_object {
    // const name = args.name;
    // const duration_increments = args.duration_increments;
    // const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  get_name(args: nameservice.get_name_arguments): nameservice.get_name_result {
    // const name = args.name;

    // YOUR CODE HERE

    const res = new nameservice.get_name_result();
    // res.domain = ;
    // res.name = ;
    // res.owner = ;
    // res.expiration = ;
    // res.sub_names_count = ;
    // res.locked_kap_tokens = ;
    // res.has_expired = ;
    // res.can_be_reclaimed = ;

    return res;
  }

  get_metadata(
    args: nameservice.get_metadata_arguments
  ): nameservice.metadata_object {
    // YOUR CODE HERE

    const res = new nameservice.metadata_object();
    // res.tla_mint_fee = ;
    // res.kap_token_address = ;

    return res;
  }
}
