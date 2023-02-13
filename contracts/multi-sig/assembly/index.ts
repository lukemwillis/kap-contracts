import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Multisig as ContractClass } from "./Multisig";
import { multisig as ProtoNamespace } from "./proto/multisig";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    case 0x4a2dbd90: {
      const args = Protobuf.decode<authority.authorize_arguments>(
        contractArgs.args,
        authority.authorize_arguments.decode
      );
      const res = c.authorize(args);
      retbuf = Protobuf.encode(res, authority.authorize_result.encode);
      break;
    }

    case 0xa311475a: {
      const args = Protobuf.decode<ProtoNamespace.add_signer_arguments>(
        contractArgs.args,
        ProtoNamespace.add_signer_arguments.decode
      );
      const res = c.add_signer(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.empty_object.encode);
      break;
    }

    case 0x5eec8a8c: {
      const args = Protobuf.decode<ProtoNamespace.remove_signer_arguments>(
        contractArgs.args,
        ProtoNamespace.remove_signer_arguments.decode
      );
      const res = c.remove_signer(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.empty_object.encode);
      break;
    }

    case 0xd5f112b9: {
      const args = Protobuf.decode<ProtoNamespace.get_signers_arguments>(
        contractArgs.args,
        ProtoNamespace.get_signers_arguments.decode
      );
      const res = c.get_signers(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.get_signers_result.encode);
      break;
    }

    default:
      System.exit(1);
      break;
  }

  System.exit(0, retbuf);
  return 0;
}

main();
