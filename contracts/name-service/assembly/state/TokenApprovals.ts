import { Storage } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const TOKEN_APPROVALS_SPACE_ID = 6;

export class TokenApprovals extends Storage.Map<string, nameservice.bytes_address_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      TOKEN_APPROVALS_SPACE_ID,
      nameservice.bytes_address_object.decode,
      nameservice.bytes_address_object.encode,
      // no token approvals by default
      () => new nameservice.bytes_address_object()
    );
  }
}
