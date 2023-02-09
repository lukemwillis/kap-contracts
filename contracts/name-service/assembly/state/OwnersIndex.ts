import { Crypto, Protobuf, Storage, System } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const OWNERS_INDEX_SPACE_ID = 2;

export class OwnersIndex extends Storage.ProtoMap<nameservice.owner_index_key, nameservice.name_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      OWNERS_INDEX_SPACE_ID,
      nameservice.owner_index_key.decode,
      nameservice.owner_index_key.encode,
      nameservice.name_object.decode,
      nameservice.name_object.encode
    );
  }

  /**
   * Remove owner index object for previous owner (if provided) and add owner index object for newOwner (if provided)
   */
  updateIndex(
    nameKey: nameservice.name_object, 
    previousOwner: Uint8Array, 
    newOwner: Uint8Array = new Uint8Array(0)
  ): void {
    const nameKeyHash = System.hash(
      Crypto.multicodec.sha2_256,
      Protobuf.encode(nameKey, nameservice.name_object.encode)
    )!;

    let indexKey: nameservice.owner_index_key;

    // remove previous owner index
    if (previousOwner.length > 0) {
      indexKey = new nameservice.owner_index_key(previousOwner, nameKeyHash);
      this.remove(indexKey);
    }

    // add new owner index
    if (newOwner.length > 0) {
      indexKey = new nameservice.owner_index_key(newOwner, nameKeyHash);
      this.put(indexKey, nameKey);
    }
  }
}
