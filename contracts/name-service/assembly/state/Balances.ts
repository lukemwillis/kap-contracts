import { Storage } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const BALANCES_SPACE_ID = 3;

export class Balances extends Storage.Map<Uint8Array, nameservice.balance_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      BALANCES_SPACE_ID,
      nameservice.balance_object.decode,
      nameservice.balance_object.encode,
      // 0 balance by default
      () => new nameservice.balance_object()
    );
  }
}
