import { Storage } from "@koinos/sdk-as";
import { testcollection } from "../proto/testcollection";

const BALANCES_SPACE_ID = 2;

export class Balances extends Storage.Map<Uint8Array, testcollection.balance_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      BALANCES_SPACE_ID,
      testcollection.balance_object.decode,
      testcollection.balance_object.encode,
      () => new testcollection.balance_object()
    );
  }
}