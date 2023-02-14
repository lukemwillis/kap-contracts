import { Base58, Storage } from "@koinos/sdk-as";
import { nameservice } from "../proto/nameservice";

const OPERATOR_APPROVALS_SPACE_ID = 4;

export class OperatorApprovals extends Storage.Map<
  string,
  nameservice.operator_approval_object
> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      OPERATOR_APPROVALS_SPACE_ID,
      nameservice.operator_approval_object.decode,
      nameservice.operator_approval_object.encode,
      // no operator approvals by default
      () => new nameservice.operator_approval_object()
    );
  }

  getApproval(
    approver: Uint8Array,
    operator: Uint8Array
  ): nameservice.operator_approval_object | null {
    const key = `${Base58.encode(approver)}_${Base58.encode(operator)}`;
    return super.get(key);
  }

  putApproval(
    approver: Uint8Array,
    operator: Uint8Array,
    approval: nameservice.operator_approval_object
  ): void {
    const key = `${Base58.encode(approver)}_${Base58.encode(operator)}`;
    return super.put(key, approval);
  }
}
