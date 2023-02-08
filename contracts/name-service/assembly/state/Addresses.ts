import { Storage } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const ADDRESSES_SPACE_ID = 2;

export class Addresses extends Storage.ProtoMap<nameservice.address_key, nameservice.name_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId, 
      ADDRESSES_SPACE_ID, 
      nameservice.address_key.decode, 
      nameservice.address_key.encode,
      nameservice.name_object.decode, 
      nameservice.name_object.encode
    );
  }
}
