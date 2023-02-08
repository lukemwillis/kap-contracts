import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Nameservice as ContractClass } from "./Nameservice";
import { nameservice as ProtoNamespace } from "./proto/nameservice";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    case 0xdc6f17bb: {
      const args = Protobuf.decode<ProtoNamespace.mint_arguments>(
        contractArgs.args,
        ProtoNamespace.mint_arguments.decode
      );
      const res = c.mint(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.empty_object.encode);
      break;
    }

    case 0x859facc5: {
      const args = Protobuf.decode<ProtoNamespace.burn_arguments>(
        contractArgs.args,
        ProtoNamespace.burn_arguments.decode
      );
      const res = c.burn(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.empty_object.encode);
      break;
    }

    case 0x27f576ca: {
      const args = Protobuf.decode<ProtoNamespace.transfer_arguments>(
        contractArgs.args,
        ProtoNamespace.transfer_arguments.decode
      );
      const res = c.transfer(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.empty_object.encode);
      break;
    }

    case 0xa36a2ce1: {
      const args = Protobuf.decode<ProtoNamespace.renew_arguments>(
        contractArgs.args,
        ProtoNamespace.renew_arguments.decode
      );
      const res = c.renew(args);
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

    case 0xcd5c6518: {
      const args = Protobuf.decode<ProtoNamespace.get_names_arguments>(
        contractArgs.args,
        ProtoNamespace.get_names_arguments.decode
      );
      const res = c.get_names(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.get_names_result.encode);
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
