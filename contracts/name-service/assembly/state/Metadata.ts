import { Storage } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const METADATA_SPACE_ID = 0;

export class Metadata extends Storage.Obj<nameservice.metadata_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      METADATA_SPACE_ID, 
      nameservice.metadata_object.decode, 
      nameservice.metadata_object.encode,
      // the tla_registration_fee is set to 0 by default
      () => new nameservice.metadata_object()
    );
  }
}
