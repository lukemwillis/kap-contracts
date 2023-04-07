import { System, Protobuf, authority } from "@koinos/sdk-as";
import { testcollection } from "./proto/testcollection";

export class Testcollection {
  mint(args: testcollection.mint_arguments): testcollection.empty_object {
    // const owner = args.owner;
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new testcollection.empty_object();

    return res;
  }

  transfer(
    args: testcollection.transfer_arguments
  ): testcollection.empty_object {
    // const from = args.from;
    // const to = args.to;
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new testcollection.empty_object();

    return res;
  }

  balance_of(
    args: testcollection.balance_of_arguments
  ): testcollection.balance_object {
    // const owner = args.owner;

    // YOUR CODE HERE

    const res = new testcollection.balance_object();
    // res.value = ;

    return res;
  }

  owner_of(
    args: testcollection.owner_of_arguments
  ): testcollection.owner_object {
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new testcollection.owner_object();
    // res.owner = ;

    return res;
  }
}
