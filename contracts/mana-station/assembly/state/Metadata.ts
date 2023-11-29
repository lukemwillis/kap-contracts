import { Storage } from '@koinos/sdk-as';
import { manastation } from '../proto/manastation';

const METADATA_SPACE_ID = 0;

export class Metadata extends Storage.Obj<manastation.metadata_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      METADATA_SPACE_ID, 
      manastation.metadata_object.decode, 
      manastation.metadata_object.encode,
      () => new manastation.metadata_object()
    );
  }
}
