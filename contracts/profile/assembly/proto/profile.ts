import { Writer, Reader } from "as-proto";

export namespace profile {
  export class update_profile_arguments {
    static encode(message: update_profile_arguments, writer: Writer): void {
      if (message.address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.address);
      }

      const unique_name_profile = message.profile;
      if (unique_name_profile !== null) {
        writer.uint32(18);
        writer.fork();
        profile_object.encode(unique_name_profile, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): update_profile_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new update_profile_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.address = reader.bytes();
            break;

          case 2:
            message.profile = profile_object.decode(reader, reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    address: Uint8Array;
    profile: profile_object | null;

    constructor(
      address: Uint8Array = new Uint8Array(0),
      profile: profile_object | null = null
    ) {
      this.address = address;
      this.profile = profile;
    }
  }

  export class get_profile_arguments {
    static encode(message: get_profile_arguments, writer: Writer): void {
      if (message.address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.address);
      }
    }

    static decode(reader: Reader, length: i32): get_profile_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_profile_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.address = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    address: Uint8Array;

    constructor(address: Uint8Array = new Uint8Array(0)) {
      this.address = address;
    }
  }

  export class set_metadata_arguments {
    static encode(message: set_metadata_arguments, writer: Writer): void {
      const unique_name_metadata = message.metadata;
      if (unique_name_metadata !== null) {
        writer.uint32(10);
        writer.fork();
        metadata_object.encode(unique_name_metadata, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): set_metadata_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_metadata_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.metadata = metadata_object.decode(reader, reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    metadata: metadata_object | null;

    constructor(metadata: metadata_object | null = null) {
      this.metadata = metadata;
    }
  }

  @unmanaged
  export class get_metadata_arguments {
    static encode(message: get_metadata_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): get_metadata_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_metadata_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class empty_object {
    static encode(message: empty_object, writer: Writer): void {}

    static decode(reader: Reader, length: i32): empty_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new empty_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class profile_object {
    static encode(message: profile_object, writer: Writer): void {
      if (message.avatar_contract_id.length != 0) {
        writer.uint32(10);
        writer.bytes(message.avatar_contract_id);
      }

      if (message.avatar_token_id.length != 0) {
        writer.uint32(18);
        writer.bytes(message.avatar_token_id);
      }

      if (message.name.length != 0) {
        writer.uint32(26);
        writer.string(message.name);
      }

      if (message.bio.length != 0) {
        writer.uint32(34);
        writer.string(message.bio);
      }

      if (message.theme.length != 0) {
        writer.uint32(42);
        writer.string(message.theme);
      }

      const unique_name_links = message.links;
      for (let i = 0; i < unique_name_links.length; ++i) {
        writer.uint32(50);
        writer.fork();
        link_object.encode(unique_name_links[i], writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): profile_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new profile_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.avatar_contract_id = reader.bytes();
            break;

          case 2:
            message.avatar_token_id = reader.bytes();
            break;

          case 3:
            message.name = reader.string();
            break;

          case 4:
            message.bio = reader.string();
            break;

          case 5:
            message.theme = reader.string();
            break;

          case 6:
            message.links.push(link_object.decode(reader, reader.uint32()));
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    avatar_contract_id: Uint8Array;
    avatar_token_id: Uint8Array;
    name: string;
    bio: string;
    theme: string;
    links: Array<link_object>;

    constructor(
      avatar_contract_id: Uint8Array = new Uint8Array(0),
      avatar_token_id: Uint8Array = new Uint8Array(0),
      name: string = "",
      bio: string = "",
      theme: string = "",
      links: Array<link_object> = []
    ) {
      this.avatar_contract_id = avatar_contract_id;
      this.avatar_token_id = avatar_token_id;
      this.name = name;
      this.bio = bio;
      this.theme = theme;
      this.links = links;
    }
  }

  export class link_object {
    static encode(message: link_object, writer: Writer): void {
      if (message.key.length != 0) {
        writer.uint32(10);
        writer.string(message.key);
      }

      if (message.value.length != 0) {
        writer.uint32(18);
        writer.string(message.value);
      }
    }

    static decode(reader: Reader, length: i32): link_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new link_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.key = reader.string();
            break;

          case 2:
            message.value = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    key: string;
    value: string;

    constructor(key: string = "", value: string = "") {
      this.key = key;
      this.value = value;
    }
  }

  export class metadata_object {
    static encode(message: metadata_object, writer: Writer): void {
      if (message.kap_nameservice_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.kap_nameservice_address);
      }
    }

    static decode(reader: Reader, length: i32): metadata_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new metadata_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.kap_nameservice_address = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    kap_nameservice_address: Uint8Array;

    constructor(kap_nameservice_address: Uint8Array = new Uint8Array(0)) {
      this.kap_nameservice_address = kap_nameservice_address;
    }
  }

  export class bytes_object {
    static encode(message: bytes_object, writer: Writer): void {
      if (message.bytes.length != 0) {
        writer.uint32(10);
        writer.bytes(message.bytes);
      }
    }

    static decode(reader: Reader, length: i32): bytes_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new bytes_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.bytes = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    bytes: Uint8Array;

    constructor(bytes: Uint8Array = new Uint8Array(0)) {
      this.bytes = bytes;
    }
  }
}
