import { System, Protobuf, authority } from "@koinos/sdk-as";
import { profile } from "./proto/profile";

export class Profile {
  update_profile(args: profile.update_profile_arguments): profile.empty_object {
    // const address = args.address;
    // const profile = args.profile;

    // YOUR CODE HERE

    const res = new profile.empty_object();

    return res;
  }

  get_profile(args: profile.get_profile_arguments): profile.profile_object {
    // const address = args.address;

    // YOUR CODE HERE

    const res = new profile.profile_object();
    // res.avatar_contract_id = ;
    // res.avatar_token_id = ;
    // res.name = ;
    // res.bio = ;
    // res.theme = ;
    // res.links = ;

    return res;
  }

  set_metadata(args: profile.set_metadata_arguments): profile.empty_object {
    // const metadata = args.metadata;

    // YOUR CODE HERE

    const res = new profile.empty_object();

    return res;
  }

  get_metadata(args: profile.get_metadata_arguments): profile.metadata_object {
    // YOUR CODE HERE

    const res = new profile.metadata_object();
    // res.nameservice_address = ;

    return res;
  }
}
