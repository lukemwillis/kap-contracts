import { Storage } from "@koinos/sdk-as";
import { testcollection } from "../proto/testcollection";

const TOKENS_SPACE_ID = 1;

export class Tokens extends Storage.Map<Uint8Array, testcollection.owner_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      TOKENS_SPACE_ID,
      testcollection.owner_object.decode,
      testcollection.owner_object.encode,
      () => new testcollection.owner_object()
    );
  }
}