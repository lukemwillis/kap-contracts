import { Storage } from "@koinos/sdk-as";
import { nameservice } from "../proto/nameservice";

const OPERATOR_APPROVALS_SPACE_ID = 4;

export class OperatorApprovals extends Storage.ProtoMap<
  nameservice.operator_approval_key,
  nameservice.bool_object
> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      OPERATOR_APPROVALS_SPACE_ID,
      nameservice.operator_approval_key.decode,
      nameservice.operator_approval_key.encode,
      nameservice.bool_object.decode,
      nameservice.bool_object.encode,
      // no operator approvals by default
      () => new nameservice.bool_object()
    );
  }

  getApproval(
    approver: Uint8Array,
    operator: Uint8Array
  ): nameservice.bool_object | null {
    return this.get(new nameservice.operator_approval_key(approver, operator));
  }

  putApproval(
    approver: Uint8Array,
    operator: Uint8Array,
    approval: nameservice.bool_object
  ): void {
    return this.put(new nameservice.operator_approval_key(approver, operator), approval);
  }
}
