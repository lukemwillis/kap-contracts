import { System, Protobuf, authority, Arrays, StringBytes } from "@koinos/sdk-as";
import { OWNER_OF_ENTRYPOINT, VALID_HEX_CHARS } from "./Constants";
import { profile } from "./proto/profile";
import { Metadata } from "./state/Metadata";
import { Profiles } from "./state/Profiles";

export class Profile {
  contractId: Uint8Array = System.getContractId();
  metadata: Metadata = new Metadata(this.contractId);
  profiles: Profiles = new Profiles(this.contractId);

  /**
   * Call an NFT contract to get the owner of a token
   */
  private getTokenOwner(
    contractId: Uint8Array,
    tokenId: Uint8Array
  ): Uint8Array {
    const ownerOfArgs = new profile.bytes_object(
      tokenId
    );

    const callRes = System.call(
      contractId,
      OWNER_OF_ENTRYPOINT,
      Protobuf.encode(ownerOfArgs, profile.bytes_object.encode)
    );

    System.require(callRes.code == 0, 'failed to call owner_of');
    const decodedCallRes = Protobuf.decode<profile.bytes_object>(callRes.res.object, profile.bytes_object.decode);

    return decodedCallRes.bytes;
  }

  update_profile(args: profile.update_profile_arguments): profile.empty_object {
    System.require(args.address.length > 0, 'missing "address" argument');
    System.require(args.profile != null, 'missing "profile" argument');

    const address = args.address;
    const profileObj = args.profile!;

    // only the owner of address can update the profile
    System.requireAuthority(authority.authorization_type.contract_call, address);

    // if an avatar is set, check ownership
    if (profileObj.avatar_contract_id.length > 0 && profileObj.avatar_token_id.length > 0) {
      const avatarOwner = this.getTokenOwner(profileObj.avatar_contract_id, profileObj.avatar_token_id);
      System.require(Arrays.equal(address, avatarOwner), 'provided "address" is not the owner of the token set as avatar.');
    }

    // if a name is set, check ownership
    if (profileObj.name.length > 0) {
      const metadata = this.metadata.get()!;

      const nameOwner = this.getTokenOwner(
        metadata.nameservice_address,
        StringBytes.stringToBytes(profileObj.name)
      );

      System.require(Arrays.equal(address, nameOwner), 'provided "address" is not the owner of the "name" provided.');
    }

    // ensure theme is a valid hex string
    if (profileObj.theme.length > 0) {
      System.require(
        profileObj.theme.length == 3 ||
        profileObj.theme.length == 6,
        '"theme" argument must be composed of 3 or 6 characters.'
      );

      for (let index = 0; index < profileObj.theme.length; index++) {
        const hexChar = profileObj.theme.charAt(index);
        System.require(VALID_HEX_CHARS.includes(hexChar), `"${hexChar}" is not a valid hex character`);
      }
    }

    this.profiles.put(address, profileObj);

    return new profile.empty_object();
  }

  get_profile(args: profile.get_profile_arguments): profile.profile_object {
    const address = args.address;

    System.require(args.address.length > 0, 'missing "address" argument');

    // get profile
    const profileObj = this.profiles.get(address)!;

    // if an avatar is set, check ownership
    if (profileObj.avatar_contract_id.length > 0 && profileObj.avatar_token_id.length > 0) {
      const avatarOwner = this.getTokenOwner(profileObj.avatar_contract_id, profileObj.avatar_token_id);

      // if not owner anymore, clear the avatar related fields
      if (!Arrays.equal(address, avatarOwner)) {
        profileObj.avatar_contract_id = new Uint8Array(0);
        profileObj.avatar_token_id = new Uint8Array(0);
      }
    }

    // if a name is set, check ownership
    if (profileObj.name.length > 0) {
      const metadata = this.metadata.get()!;

      const nameOwner = this.getTokenOwner(
        metadata.nameservice_address,
        StringBytes.stringToBytes(profileObj.name)
      );

      // if not owner anymore, clear the name related fields
      if (!Arrays.equal(address, nameOwner)) {
        profileObj.name = '';
      }
    }

    return profileObj;
  }

  set_metadata(args: profile.set_metadata_arguments): profile.empty_object {
    // only this contract can set the metadata
    System.requireAuthority(authority.authorization_type.contract_call, this.contractId);

    System.require(args.metadata != null, 'missing "metadata" argument');

    this.metadata.put(args.metadata!);

    return new profile.empty_object();
  }

  get_metadata(args: profile.get_metadata_arguments): profile.metadata_object {
    return this.metadata.get()!;
  }
}
