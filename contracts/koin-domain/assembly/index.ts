import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Koindomain as ContractClass } from "./Koindomain";
import { koindomain as ProtoNamespace } from "./proto/koindomain";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    case 0x69213583: {
      const args =
        Protobuf.decode<ProtoNamespace.authorize_registration_arguments>(
          contractArgs.args,
          ProtoNamespace.authorize_registration_arguments.decode
        );
      const res = c.authorize_registration(args);
      retbuf = Protobuf.encode(
        res,
        ProtoNamespace.authorize_registration_result.encode
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
