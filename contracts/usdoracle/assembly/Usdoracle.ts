import { System } from "@koinos/sdk-as";
import { usdoracle } from "./proto/usdoracle";

export class Usdoracle {
  hello(args: usdoracle.hello_arguments): usdoracle.hello_result {
    const name = args.name!;

    const res = new usdoracle.hello_result();
    res.value = `Hello, ${name}!`;

    System.log(res.value!);

    return res;
  }
}
