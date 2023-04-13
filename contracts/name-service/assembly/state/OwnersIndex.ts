import { chain, Crypto, Protobuf, StringBytes, System, system_calls } from '@koinos/sdk-as';
import { collections } from '../proto/collections';

const OWNERS_INDEX_SPACE_ID = 2;

// TODO what is owners index? Switch to map to remove owner_index_key type?
export class OwnersIndex {
  space: chain.object_space;

  constructor(contractId: Uint8Array) {
    this.space = new chain.object_space(false, contractId, OWNERS_INDEX_SPACE_ID);
  }

  /**
   * Remove owner index object for previous owner (if provided) and add owner index object for newOwner (if provided)
   */
  updateIndex(
    name: string,
    previousOwner: Uint8Array,
    newOwner: Uint8Array = new Uint8Array(0)
  ): void {
    const nameBytes = StringBytes.stringToBytes(name);

    const nameKeyHash = System.hash(
      Crypto.multicodec.sha2_256,
      nameBytes
    )!;

    let indexKey: collections.owner_index_key;

    // remove previous owner index
    if (previousOwner.length > 0) {
      indexKey = new collections.owner_index_key(previousOwner, nameKeyHash);
      System.removeObject(this.space, Protobuf.encode(indexKey, collections.owner_index_key.encode));
    }

    // add new owner index
    if (newOwner.length > 0) {
      indexKey = new collections.owner_index_key(newOwner, nameKeyHash);
      System.putBytes(this.space, Protobuf.encode(indexKey, collections.owner_index_key.encode), nameBytes);
    }
  }

  getNext(key: collections.owner_index_key): system_calls.database_object | null {
    return System.getNextBytes(this.space, Protobuf.encode(key, collections.owner_index_key.encode));
  }

  getPrev(key: collections.owner_index_key): system_calls.database_object | null {
    return System.getPrevBytes(this.space, Protobuf.encode(key, collections.owner_index_key.encode));
  }
}
