import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Testdomain as ContractClass } from "./Testdomain";
import { testdomain as ProtoNamespace } from "./proto/testdomain";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    case 0x86cb119c: {
      const args = Protobuf.decode<ProtoNamespace.authorize_mint_arguments>(
        contractArgs.args,
        ProtoNamespace.authorize_mint_arguments.decode
      );
      const res = c.authorize_mint(args);
      retbuf = Protobuf.encode(
        res,
        ProtoNamespace.authorize_mint_result.encode
      );
      break;
    }

    case 0x0d95d6b8: {
      const args = Protobuf.decode<ProtoNamespace.authorize_burn_arguments>(
        contractArgs.args,
        ProtoNamespace.authorize_burn_arguments.decode
      );
      const res = c.authorize_burn(args);
      retbuf = Protobuf.encode(
        res,
        ProtoNamespace.authorize_burn_result.encode
      );
      break;
    }

    case 0xfc54a97f: {
      const args = Protobuf.decode<ProtoNamespace.authorize_renewal_arguments>(
        contractArgs.args,
        ProtoNamespace.authorize_renewal_arguments.decode
      );
      const res = c.authorize_renewal(args);
      retbuf = Protobuf.encode(
        res,
        ProtoNamespace.authorize_renewal_result.encode
      );
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
