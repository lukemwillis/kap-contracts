import { Storage } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const BALANCES_SPACE_ID = 3;

export class Balances extends Storage.Map<Uint8Array, nameservice.uint64_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      BALANCES_SPACE_ID,
      nameservice.uint64_object.decode,
      nameservice.uint64_object.encode,
      // 0 balance by default
      () => new nameservice.uint64_object()
    );
  }
}
