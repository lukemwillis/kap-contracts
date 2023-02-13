import { System, Protobuf, authority } from "@koinos/sdk-as";
import { usdoracle } from "./proto/usdoracle";

export class Usdoracle {
  set_latest_price(
    args: usdoracle.set_latest_price_arguments
  ): usdoracle.empty_object {
    // const token_address = args.token_address;
    // const price = args.price;

    // YOUR CODE HERE

    const res = new usdoracle.empty_object();

    return res;
  }

  get_latest_price(
    args: usdoracle.get_latest_price_arguments
  ): usdoracle.price_object {
    // const token_address = args.token_address;

    // YOUR CODE HERE

    const res = new usdoracle.price_object();
    // res.price = ;
    // res.timestamp = ;

    return res;
  }
}
