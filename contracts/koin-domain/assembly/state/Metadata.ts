import { Storage } from '@koinos/sdk-as';
import { koindomain } from '../proto/koindomain';

const METADATA_SPACE_ID = 0;

export class Metadata extends Storage.Obj<koindomain.metadata_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      METADATA_SPACE_ID, 
      koindomain.metadata_object.decode, 
      koindomain.metadata_object.encode,
      // the tla_registration_fee is set to 0 by default
      () => new koindomain.metadata_object()
    );
  }
}
