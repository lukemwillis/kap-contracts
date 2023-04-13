import { Storage } from "@koinos/sdk-as";
import { collections } from "../proto/collections";

const OPERATOR_APPROVALS_SPACE_ID = 4;

export class OperatorApprovals extends Storage.ProtoMap<
  collections.operator_approval_key,
  collections.bool_object
> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      OPERATOR_APPROVALS_SPACE_ID,
      collections.operator_approval_key.decode,
      collections.operator_approval_key.encode,
      collections.bool_object.decode,
      collections.bool_object.encode,
      // no operator approvals by default
      () => new collections.bool_object()
    );
  }

  getApproval(
    approver: Uint8Array,
    operator: Uint8Array
  ): collections.bool_object {
    return this.get(new collections.operator_approval_key(approver, operator))!;
  }

  putApproval(
    approver: Uint8Array,
    operator: Uint8Array,
    approval: collections.bool_object
  ): void {
    return this.put(new collections.operator_approval_key(approver, operator), approval);
  }
}
