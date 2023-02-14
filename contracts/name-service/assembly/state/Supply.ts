import { Storage } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const SUPPLY_SPACE_ID = 5;

export class Supply extends Storage.Obj<nameservice.uint64_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      SUPPLY_SPACE_ID, 
      nameservice.uint64_object.decode, 
      nameservice.uint64_object.encode,
      // total supply is 0 by default
      () => new nameservice.uint64_object()
    );
  }
}
