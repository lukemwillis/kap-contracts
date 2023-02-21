import { Storage } from '@koinos/sdk-as';
import { profile } from '../proto/profile';

const METADATA_SPACE_ID = 0;

export class Metadata extends Storage.Obj<profile.metadata_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      METADATA_SPACE_ID, 
      profile.metadata_object.decode, 
      profile.metadata_object.encode,
      () => new profile.metadata_object()
    );
  }
}
