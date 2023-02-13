import { Storage } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const NAMES_SPACE_ID = 1;

export class Names extends Storage.ProtoMap<nameservice.name_object, nameservice.name_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      NAMES_SPACE_ID,
      nameservice.name_object.decode,
      nameservice.name_object.encode,
      nameservice.name_object.decode,
      nameservice.name_object.encode
    );
  }
}
