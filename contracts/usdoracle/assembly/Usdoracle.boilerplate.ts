import { System, Protobuf, authority } from "@koinos/sdk-as";
import { usdoracle } from "./proto/usdoracle";

export class Usdoracle {
  hello(args: usdoracle.hello_arguments): usdoracle.hello_result {
    // const name = args.name;

    // YOUR CODE HERE

    const res = new usdoracle.hello_result();
    // res.value = ;

    return res;
  }
}
