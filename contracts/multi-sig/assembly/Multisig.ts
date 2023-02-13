import { System, Protobuf, authority, SafeMath, value, Crypto, Arrays, protocol } from "@koinos/sdk-as";
import { multisig } from "./proto/multisig";
import { AuthorizedSigners } from "./state/AuthorizedSigners";
import { Metadata } from "./state/Metadata";

const REMOVE_SIGNER_ENTRYPOINT = 0x5eec8a8c;

export class Multisig {
  contractId: Uint8Array = System.getContractId();
  metadata: Metadata = new Metadata(this.contractId);
  authorizedSigners: AuthorizedSigners = new AuthorizedSigners(this.contractId);

  /*
  * Recover an address from a signature and transactionId
  */
  private recoverAddressFromSignature(signature: Uint8Array, transactionId: Uint8Array): Uint8Array {
    return Crypto.addressFromPublicKey(System.recoverPublicKey(signature, transactionId)!);
  }

  /*
  * Check if the contract's private key was used to sign the transaction
  */
  private checkIfContractIdSigned(signatures: value.list_type, transactionId: Uint8Array): bool {
    let addr: Uint8Array;

    for (let i = 0; i < signatures.values.length; i++) {
      addr = this.recoverAddressFromSignature(
        signatures.values[i].bytes_value,
        transactionId
      );

      if (Arrays.equal(addr, this.contractId)) {
        return true;
      }
    }

    return false;
  }

  authorize(args: authority.authorize_arguments): authority.authorize_result {
    const metadata = this.metadata.get()!;

    const transactionId = System.getTransactionField('id')!.bytes_value;
    const signatures = Protobuf.decode<value.list_type>(System.getTransactionField('signatures')!.message_value!.value!, value.list_type.decode);

    let addr: Uint8Array;

    // if no authorized signers are setup
    // check for the signature of the contract id itself
    if (metadata.number_authorized_signers == 0) {
      return new authority.authorize_result(
        this.checkIfContractIdSigned(signatures, transactionId)
      );
    } else {
      // otherwise, check that the transaction has all required signatures
      let numberOfAuthorizedSignaturesRequired: i32 = metadata.number_authorized_signers as i32;
      let signerToIgnore: Uint8Array | null = null;

      // if contract_call and we are calling the remove_signer entry point
      // ignore the signer we're trying to remove
      if (
        args.type == authority.authorization_type.contract_call &&
        args.call!.caller.length == 0 &&
        args.call!.entry_point == REMOVE_SIGNER_ENTRYPOINT
      ) {
        const removerSignerArgs = Protobuf.decode<multisig.remove_signer_arguments>(
          args.call!.data,
          multisig.remove_signer_arguments.decode
        );

        signerToIgnore = removerSignerArgs.signer;
        numberOfAuthorizedSignaturesRequired -= 1;
      } else if (args.type == authority.authorization_type.transaction_application) {
        // if transaction_application
        // check all operations to get the signer to ignore
        // only 1 operation is allowed if one of them is remove_signer
        const operations = Protobuf.decode<value.list_type>(System.getTransactionField('operations')!.message_value!.value!, value.list_type.decode);

        for (let index = 0; index < operations.values.length; index++) {
          const operation = Protobuf.decode<protocol.operation>(operations.values[index].message_value!.value!, protocol.operation.decode);

          // if the op is a call_contract calling this contract and the remove_signer entrypoint
          if (
            operation.call_contract != null &&
            Arrays.equal(operation.call_contract!.contract_id, this.contractId) &&
            operation.call_contract!.entry_point == REMOVE_SIGNER_ENTRYPOINT
          ) {
            System.require(operations.values.length == 1, 'can only call remove_signer in a transaction with 1 operation');

            const removerSignerArgs = Protobuf.decode<multisig.remove_signer_arguments>(
              operation.call_contract!.args,
              multisig.remove_signer_arguments.decode
            );

            signerToIgnore = removerSignerArgs.signer;
            numberOfAuthorizedSignaturesRequired -= 1;
          }
        }
      }

      // only continue if enough signatures were provided
      // we allow for more signatures simply because there might be cases where we need signatures from other accounts (e.g.: mana sharing)
      if (signatures.values.length >= numberOfAuthorizedSignaturesRequired) {
        const uniqueAuthorizedSignatures = new Map<string, boolean>();
        let addrStr: string;

        // numberOfAuthorizedSignaturesRequired is 0, then check that contractId signed
        if(numberOfAuthorizedSignaturesRequired <= 0) {
          return new authority.authorize_result(
            this.checkIfContractIdSigned(signatures, transactionId)
          );
        }

        // otherwise, check authorized signers
        for (let i = 0; i < signatures.values.length; i++) {
          addr = this.recoverAddressFromSignature(
            signatures.values[i].bytes_value,
            transactionId
          );
          addrStr = addr.toString();

          if (
            // if it is an authorized signer
            this.authorizedSigners.has(addr) && 
            // and it is not the signer that has to be ignored
            !Arrays.equal(signerToIgnore, addr)
          ) {
            // if an authorized signer sign multiple times
            // only one signature will be counted
            uniqueAuthorizedSignatures.set(addrStr, true);
          }
        }

        // revert if not enough valid signatures were provided
        System.require(
          uniqueAuthorizedSignatures.keys().length >= numberOfAuthorizedSignaturesRequired,
          `multisig failed, only ${uniqueAuthorizedSignatures.keys().length}/${numberOfAuthorizedSignaturesRequired} valid signatures provided`
        );

        return new authority.authorize_result(true);
      }
    }

    return new authority.authorize_result(false);
  }

  add_signer(args: multisig.add_signer_arguments): multisig.empty_object {
    // call authorize to check that all signers signed
    System.requireAuthority(authority.authorization_type.contract_call, this.contractId);

    // check arguments
    const signer = args.signer;

    System.require(signer.length > 0, 'missing "signer" argument');

    // update authorized signers state
    this.authorizedSigners.put(signer, new multisig.empty_object());

    // update metadata state
    const metadataObj = this.metadata.get()!;
    metadataObj.number_authorized_signers = SafeMath.add(metadataObj.number_authorized_signers, 1);
    this.metadata.put(metadataObj);

    return new multisig.empty_object();
  }

  remove_signer(args: multisig.remove_signer_arguments): multisig.empty_object {
    // check arguments
    const signer = args.signer;

    System.require(
      this.authorizedSigners.has(signer),
      'signer being removed is not an authorized signer'
    );

    // call authorize to check that all signers signed
    // pass the signer being removed so that we don't require it when checking signatures
    System.requireAuthority(authority.authorization_type.contract_call, this.contractId);

    // System.require(
    //   System.checkAuthority(
    //     authority.authorization_type.contract_call,
    //     this.contractId,
    //   ),
    //   'not authorized'
    // );

    // update authorized signers state
    this.authorizedSigners.remove(signer);

    // update metadata state
    const metadataObj = this.metadata.get()!;
    metadataObj.number_authorized_signers = SafeMath.sub(metadataObj.number_authorized_signers, 1);
    this.metadata.put(metadataObj);

    return new multisig.empty_object();
  }

  get_signers(
    args: multisig.get_signers_arguments
  ): multisig.get_signers_result {
    // get all authorized signers
    const authorizedSigners = this.authorizedSigners.getManyKeys(new Uint8Array(0));

    return new multisig.get_signers_result(authorizedSigners);
  }
}
