import { System, Protobuf, authority } from "@koinos/sdk-as";
import { multisig } from "./proto/multisig";

export class Multisig {
  authorize(args: authority.authorize_arguments): authority.authorize_result {
    // const call = args.call;
    // const type = args.type;

    // YOUR CODE HERE

    const res = new authority.authorize_result();
    res.value = true;

    return res;
  }

  add_signer(args: multisig.add_signer_arguments): multisig.empty_object {
    // const signer = args.signer;

    // YOUR CODE HERE

    const res = new multisig.empty_object();

    return res;
  }

  remove_signer(args: multisig.remove_signer_arguments): multisig.empty_object {
    // const signer = args.signer;

    // YOUR CODE HERE

    const res = new multisig.empty_object();

    return res;
  }

  get_signers(
    args: multisig.get_signers_arguments
  ): multisig.get_signers_result {
    // YOUR CODE HERE

    const res = new multisig.get_signers_result();
    // res.authorized_signers = ;

    return res;
  }
}
