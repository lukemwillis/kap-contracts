import { authority, Crypto, Protobuf, System, value } from "@koinos/sdk-as";
import { manastation } from './proto/manastation';
import { Metadata } from "./state/Metadata";

const BALANCE_OF_ENTRYPOINT = 0x5c721497;

export class Manastation {
  contractId: Uint8Array = System.getContractId();
  metadata: Metadata = new Metadata(this.contractId);

  private hasKapName(address: Uint8Array, nameserviceAddress: Uint8Array): bool {
    const args = new manastation.balance_of_args(address);

    const callRes = System.call(
      nameserviceAddress,
      BALANCE_OF_ENTRYPOINT,
      Protobuf.encode(args, manastation.balance_of_args.encode)
    );
    System.require(callRes.code == 0, "failed to retrieve KAP balance");
    const res = Protobuf.decode<manastation.balance_of_res>(
      callRes.res.object!,
      manastation.balance_of_res.decode
    );

    return res.value > 0;
  }

  /*
  * Recover an address from a signature and transactionId
  */
  private recoverAddressFromSignature(signature: Uint8Array, transactionId: Uint8Array): Uint8Array {
    return Crypto.addressFromPublicKey(System.recoverPublicKey(signature, transactionId)!);
  }

  /*
  * Check if an address was used to sign the transaction
  */
  private checkIfAnySignerHasKapName(signatures: value.list_type, transactionId: Uint8Array, nameserviceAddress: Uint8Array): bool {
    let addr: Uint8Array;

    for (let i = 0; i < signatures.values.length; i++) {
      addr = this.recoverAddressFromSignature(
        signatures.values[i].bytes_value!,
        transactionId
      );

      if (this.hasKapName(addr, nameserviceAddress)) {
        return true;
      }
    }

    return false;
  }

  authorize(_: authority.authorize_arguments): authority.authorize_result {
    // const metadata = this.metadata.get()!;

    // const transactionId = System.getTransactionField('id')!.bytes_value!;
    // const signatures = Protobuf.decode<value.list_type>(System.getTransactionField('signatures')!.message_value!.value!, value.list_type.decode);
    // const rcLimit = System.getTransactionField('header.rc_limit')!.uint64_value;

    // return new authority.authorize_result(rcLimit <= metadata.max_rc_limit && this.checkIfAnySignerHasKapName(signatures, transactionId, metadata.nameservice_address!));

    return new authority.authorize_result(true);
  }

  set_metadata(
    args: manastation.set_metadata_arguments
  ): manastation.empty_object {
    // only this contract can set the metadata for now
    System.requireAuthority(
      authority.authorization_type.contract_call,
      this.contractId
    );

    const nameservice_address = args.nameservice_address;
    const max_rc_limit = args.max_rc_limit;

    this.metadata.put(
      new manastation.metadata_object(
        nameservice_address, 
        max_rc_limit, 
      )
    );

    return new manastation.empty_object();
  }

  get_metadata(
    _: manastation.get_metadata_arguments
  ): manastation.metadata_object {
    return this.metadata.get()!;
  }
}
