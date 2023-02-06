import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Nameservice as ContractClass } from "./Nameservice";
import { nameservice as ProtoNamespace } from "./proto/nameservice";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    case 0x87780fa5: {
      const args = Protobuf.decode<ProtoNamespace.register_arguments>(
        contractArgs.args,
        ProtoNamespace.register_arguments.decode
      );
      const res = c.register(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.empty_object.encode);
      break;
    }

    case 0xe5070a16: {
      const args = Protobuf.decode<ProtoNamespace.get_name_arguments>(
        contractArgs.args,
        ProtoNamespace.get_name_arguments.decode
      );
      const res = c.get_name(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.name_object.encode);
      break;
    }

    case 0xfcf7a68f: {
      const args = Protobuf.decode<ProtoNamespace.get_metadata_arguments>(
        contractArgs.args,
        ProtoNamespace.get_metadata_arguments.decode
      );
      const res = c.get_metadata(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.metadata_object.encode);
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
