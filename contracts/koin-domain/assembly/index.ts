import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Koindomain as ContractClass } from "./Koindomain";
import { koindomain as ProtoNamespace } from "./proto/koindomain";

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

    case 0x919e92bb: {
      const args = Protobuf.decode<ProtoNamespace.get_purchases_arguments>(
        contractArgs.args,
        ProtoNamespace.get_purchases_arguments.decode
      );
      const res = c.get_purchases(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.get_purchases_result.encode);
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
