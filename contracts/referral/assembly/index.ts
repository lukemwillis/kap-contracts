import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Referral as ContractClass } from "./Referral";
import { referral as ProtoNamespace } from "./proto/referral";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    case 0x2e5106cc: {
      const args = Protobuf.decode<ProtoNamespace.redeem_arguments>(
        contractArgs.args,
        ProtoNamespace.redeem_arguments.decode
      );
      const res = c.redeem(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.empty_message.encode);
      break;
    }

    case 0xf23d6402: {
      const args = Protobuf.decode<ProtoNamespace.get_referral_code_arguments>(
        contractArgs.args,
        ProtoNamespace.get_referral_code_arguments.decode
      );
      const res = c.get_referral_code(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.referral_code.encode);
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
