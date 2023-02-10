import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Usdoracle as ContractClass } from "./Usdoracle";
import { usdoracle as ProtoNamespace } from "./proto/usdoracle";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    case 0xe6ae4302: {
      const args = Protobuf.decode<ProtoNamespace.set_latest_price_arguments>(
        contractArgs.args,
        ProtoNamespace.set_latest_price_arguments.decode
      );
      const res = c.set_latest_price(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.empty_object.encode);
      break;
    }

    case 0x8d26b6d6: {
      const args = Protobuf.decode<ProtoNamespace.get_latest_price_arguments>(
        contractArgs.args,
        ProtoNamespace.get_latest_price_arguments.decode
      );
      const res = c.get_latest_price(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.price_object.encode);
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
