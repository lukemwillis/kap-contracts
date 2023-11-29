import { System, Protobuf, authority } from "@koinos/sdk-as";
import { manastation } from "./proto/manastation";

export class Manastation {
  authorize(args: authority.authorize_arguments): authority.authorize_result {
    // const call = args.call;
    // const type = args.type;

    // YOUR CODE HERE

    const res = new authority.authorize_result();
    res.value = true;

    return res;
  }

  set_metadata(
    args: manastation.set_metadata_arguments
  ): manastation.empty_object {
    // const nameservice_address = args.nameservice_address;
    // const max_rc_limit = args.max_rc_limit;

    // YOUR CODE HERE

    const res = new manastation.empty_object();

    return res;
  }

  get_metadata(
    args: manastation.get_metadata_arguments
  ): manastation.metadata_object {
    // YOUR CODE HERE

    const res = new manastation.metadata_object();
    // res.nameservice_address = ;
    // res.max_rc_limit = ;

    return res;
  }
}
