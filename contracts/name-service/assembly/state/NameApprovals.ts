import { chain, System } from '@koinos/sdk-as';

const NAME_APPROVALS_SPACE_ID = 6;

export class NameApprovals {
  space: chain.object_space;

  constructor(contractId: Uint8Array) {
    this.space = new chain.object_space(false, contractId, NAME_APPROVALS_SPACE_ID);
  }

  get(name: string): Uint8Array | null {
    return System.getBytes(this.space, name);
  }

  put(name: string, address: Uint8Array): void{
    System.putBytes(this.space, name, address);
  }

  remove(name: string): void{
    System.removeObject(this.space, name);
  }
}
