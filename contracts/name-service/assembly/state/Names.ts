import { Storage } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const NAMES_SPACE_ID = 1;

export class Names extends Storage.Map<string, nameservice.name_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      NAMES_SPACE_ID,
      nameservice.name_object.decode,
      nameservice.name_object.encode
    );
  }
}
