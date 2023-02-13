import { Storage } from '@koinos/sdk-as';
import { multisig } from '../proto/multisig';

const METADATA_SPACE_ID = 0;

export class Metadata extends Storage.Obj<multisig.metadata_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      METADATA_SPACE_ID, 
      multisig.metadata_object.decode, 
      multisig.metadata_object.encode,
      () => new multisig.metadata_object()
    );
  }
}
