import { Storage } from '@koinos/sdk-as';
import { collections } from '../proto/collections';

const METADATA_SPACE_ID = 0;

export class Metadata extends Storage.Obj<collections.metadata_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      METADATA_SPACE_ID, 
      collections.metadata_object.decode, 
      collections.metadata_object.encode,
      // the tla_registration_fee is set to 0 by default
      () => new collections.metadata_object()
    );
  }
}
