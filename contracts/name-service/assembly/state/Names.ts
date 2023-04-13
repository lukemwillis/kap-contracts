import { Storage } from '@koinos/sdk-as';
import { collections } from '../proto/collections';

const NAMES_SPACE_ID = 1;

export class Names extends Storage.Map<string, collections.name_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      NAMES_SPACE_ID,
      collections.name_object.decode,
      collections.name_object.encode
    );
  }
}
