import { System, Protobuf, authority } from "@koinos/sdk-as";
import { referral } from "./proto/referral";

export class Referral {
  redeem(args: referral.redeem_arguments): referral.empty_message {
    // const referral_code = args.referral_code;

    // YOUR CODE HERE

    const res = new referral.empty_message();

    return res;
  }

  get_referral_code(
    args: referral.get_referral_code_arguments
  ): referral.referral_code {
    // const referral_code = args.referral_code;

    // YOUR CODE HERE

    const res = new referral.referral_code();
    // res.metadata = ;
    // res.signature = ;

    return res;
  }
}
