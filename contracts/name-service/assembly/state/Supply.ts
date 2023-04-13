import { Storage } from '@koinos/sdk-as';
import { collections } from '../proto/collections';

const SUPPLY_SPACE_ID = 5;

export class Supply extends Storage.Obj<collections.uint64_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      SUPPLY_SPACE_ID, 
      collections.uint64_object.decode, 
      collections.uint64_object.encode,
      // total supply is 0 by default
      () => new collections.uint64_object()
    );
  }
}
