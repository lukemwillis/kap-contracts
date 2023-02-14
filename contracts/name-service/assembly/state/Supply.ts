import { Storage } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const SUPPLY_SPACE_ID = 5;

export class Supply extends Storage.Obj<nameservice.balance_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      SUPPLY_SPACE_ID, 
      nameservice.balance_object.decode, 
      nameservice.balance_object.encode,
      // total supply is 0 by default
      () => new nameservice.balance_object()
    );
  }
}
