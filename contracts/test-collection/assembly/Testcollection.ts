import { System } from "@koinos/sdk-as";
import { testcollection } from "./proto/testcollection";
import { Tokens } from "./state/Tokens";

export class Testcollection {
  contractId: Uint8Array = System.getContractId();
  tokens: Tokens = new Tokens(this.contractId);

  mint(args: testcollection.mint_arguments): testcollection.empty_object {
    const owner = args.owner;
    const token_id = args.token_id;
    this.tokens.put(token_id, new testcollection.owner_object(owner));

    return new testcollection.empty_object();
  }

  transfer(
    args: testcollection.transfer_arguments
  ): testcollection.empty_object {
    // const from = args.from;
    const to = args.to;
    const token_id = args.token_id;

    const token = this.tokens.get(token_id)!;

    token.owner = to;

    this.tokens.put(token_id, token);

    return new testcollection.empty_object();
  }

  owner_of(
    args: testcollection.owner_of_arguments
  ): testcollection.owner_object {
    const token_id = args.token_id;

    const token = this.tokens.get(token_id)!;
    return new testcollection.owner_object(token.owner);
  }
}
