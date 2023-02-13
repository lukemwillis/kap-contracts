import { Storage } from '@koinos/sdk-as';
import { multisig } from '../proto/multisig';

const AUTHORIZED_SIGNERS_SPACE_ID = 0;

export class AuthorizedSigners extends Storage.Map<Uint8Array, multisig.empty_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      AUTHORIZED_SIGNERS_SPACE_ID, 
      multisig.empty_object.decode, 
      multisig.empty_object.encode
    );
  }
}
