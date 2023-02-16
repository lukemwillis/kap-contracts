import { Storage } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const NAME_APPROVALS_SPACE_ID = 6;

export class NameApprovals extends Storage.ProtoMap<nameservice.name_object, nameservice.bytes_address_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      NAME_APPROVALS_SPACE_ID,
      nameservice.name_object.decode,
      nameservice.name_object.encode,
      nameservice.bytes_address_object.decode,
      nameservice.bytes_address_object.encode,
      // no token approvals by default
      () => new nameservice.bytes_address_object()
    );
  }
}
