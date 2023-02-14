import { Storage } from '@koinos/sdk-as';
import { nameservice } from '../proto/nameservice';

const TOKEN_APPROVALS_SPACE_ID = 6;

export class TokenApprovals extends Storage.Map<string, nameservice.token_approval_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      TOKEN_APPROVALS_SPACE_ID,
      nameservice.token_approval_object.decode,
      nameservice.token_approval_object.encode,
      // no token approvals by default
      () => new nameservice.token_approval_object()
    );
  }
}
