import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Profile as ContractClass } from "./Profile";
import { profile as ProtoNamespace } from "./proto/profile";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    case 0xc82f92c9: {
      const args = Protobuf.decode<ProtoNamespace.update_profile_arguments>(
        contractArgs.args,
        ProtoNamespace.update_profile_arguments.decode
      );
      const res = c.update_profile(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.empty_object.encode);
      break;
    }

    case 0x459e9a25: {
      const args = Protobuf.decode<ProtoNamespace.get_profile_arguments>(
        contractArgs.args,
        ProtoNamespace.get_profile_arguments.decode
      );
      const res = c.get_profile(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.profile_object.encode);
      break;
    }

    case 0x3d59af19: {
      const args = Protobuf.decode<ProtoNamespace.set_metadata_arguments>(
        contractArgs.args,
        ProtoNamespace.set_metadata_arguments.decode
      );
      const res = c.set_metadata(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.empty_object.encode);
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
