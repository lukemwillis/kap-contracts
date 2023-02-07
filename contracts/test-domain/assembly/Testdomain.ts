import { System } from "@koinos/sdk-as";
import { testdomain } from "./proto/testdomain";

export class Testdomain {
  hello(args: testdomain.hello_arguments): testdomain.hello_result {
    const name = args.name!;

    const res = new testdomain.hello_result();
    res.value = `Hello, ${name}!`;

    System.log(res.value!);

    return res;
  }
}
