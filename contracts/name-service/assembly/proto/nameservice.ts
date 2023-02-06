import { Writer, Reader } from "as-proto";

export namespace nameservice {
  export class register_arguments {
    static encode(message: register_arguments, writer: Writer): void {
      if (message.name.length != 0) {
        writer.uint32(10);
        writer.string(message.name);
      }

      if (message.duration_increments != 0) {
        writer.uint32(16);
        writer.uint32(message.duration_increments);
      }

      if (message.owner.length != 0) {
        writer.uint32(26);
        writer.bytes(message.owner);
      }

      if (message.payment_from.length != 0) {
        writer.uint32(34);
        writer.bytes(message.payment_from);
      }

      if (message.payment_token_address.length != 0) {
        writer.uint32(42);
        writer.bytes(message.payment_token_address);
      }
    }

    static decode(reader: Reader, length: i32): register_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new register_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.name = reader.string();
            break;

          case 2:
            message.duration_increments = reader.uint32();
            break;

          case 3:
            message.owner = reader.bytes();
            break;

          case 4:
            message.payment_from = reader.bytes();
            break;

          case 5:
            message.payment_token_address = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    name: string;
    duration_increments: u32;
    owner: Uint8Array;
    payment_from: Uint8Array;
    payment_token_address: Uint8Array;

    constructor(
      name: string = "",
      duration_increments: u32 = 0,
      owner: Uint8Array = new Uint8Array(0),
      payment_from: Uint8Array = new Uint8Array(0),
      payment_token_address: Uint8Array = new Uint8Array(0)
    ) {
      this.name = name;
      this.duration_increments = duration_increments;
      this.owner = owner;
      this.payment_from = payment_from;
      this.payment_token_address = payment_token_address;
    }
  }

  export class get_name_arguments {
    static encode(message: get_name_arguments, writer: Writer): void {
      if (message.name.length != 0) {
        writer.uint32(10);
        writer.string(message.name);
      }
    }

    static decode(reader: Reader, length: i32): get_name_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_name_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.name = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    name: string;

    constructor(name: string = "") {
      this.name = name;
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

  export class metadata_object {
    static encode(message: metadata_object, writer: Writer): void {
      if (message.tla_registration_fee != 0) {
        writer.uint32(8);
        writer.uint64(message.tla_registration_fee);
      }

      if (message.kap_token_address.length != 0) {
        writer.uint32(18);
        writer.bytes(message.kap_token_address);
      }
    }

    static decode(reader: Reader, length: i32): metadata_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new metadata_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.tla_registration_fee = reader.uint64();
            break;

          case 2:
            message.kap_token_address = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    tla_registration_fee: u64;
    kap_token_address: Uint8Array;

    constructor(
      tla_registration_fee: u64 = 0,
      kap_token_address: Uint8Array = new Uint8Array(0)
    ) {
      this.tla_registration_fee = tla_registration_fee;
      this.kap_token_address = kap_token_address;
    }
  }

  export class name_object {
    static encode(message: name_object, writer: Writer): void {
      if (message.domain.length != 0) {
        writer.uint32(10);
        writer.string(message.domain);
      }

      if (message.name.length != 0) {
        writer.uint32(18);
        writer.string(message.name);
      }

      if (message.owner.length != 0) {
        writer.uint32(26);
        writer.bytes(message.owner);
      }

      if (message.expiration != 0) {
        writer.uint32(32);
        writer.uint64(message.expiration);
      }
    }

    static decode(reader: Reader, length: i32): name_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new name_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.domain = reader.string();
            break;

          case 2:
            message.name = reader.string();
            break;

          case 3:
            message.owner = reader.bytes();
            break;

          case 4:
            message.expiration = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    domain: string;
    name: string;
    owner: Uint8Array;
    expiration: u64;

    constructor(
      domain: string = "",
      name: string = "",
      owner: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0
    ) {
      this.domain = domain;
      this.name = name;
      this.owner = owner;
      this.expiration = expiration;
    }
  }

  export class authorize_registration_args {
    static encode(message: authorize_registration_args, writer: Writer): void {
      if (message.name.length != 0) {
        writer.uint32(10);
        writer.string(message.name);
      }

      if (message.domain.length != 0) {
        writer.uint32(18);
        writer.string(message.domain);
      }

      if (message.duration_increments != 0) {
        writer.uint32(24);
        writer.uint32(message.duration_increments);
      }

      if (message.owner.length != 0) {
        writer.uint32(34);
        writer.bytes(message.owner);
      }

      if (message.payment_from.length != 0) {
        writer.uint32(42);
        writer.bytes(message.payment_from);
      }

      if (message.payment_token_address.length != 0) {
        writer.uint32(50);
        writer.bytes(message.payment_token_address);
      }
    }

    static decode(reader: Reader, length: i32): authorize_registration_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_registration_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.name = reader.string();
            break;

          case 2:
            message.domain = reader.string();
            break;

          case 3:
            message.duration_increments = reader.uint32();
            break;

          case 4:
            message.owner = reader.bytes();
            break;

          case 5:
            message.payment_from = reader.bytes();
            break;

          case 6:
            message.payment_token_address = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    name: string;
    domain: string;
    duration_increments: u32;
    owner: Uint8Array;
    payment_from: Uint8Array;
    payment_token_address: Uint8Array;

    constructor(
      name: string = "",
      domain: string = "",
      duration_increments: u32 = 0,
      owner: Uint8Array = new Uint8Array(0),
      payment_from: Uint8Array = new Uint8Array(0),
      payment_token_address: Uint8Array = new Uint8Array(0)
    ) {
      this.name = name;
      this.domain = domain;
      this.duration_increments = duration_increments;
      this.owner = owner;
      this.payment_from = payment_from;
      this.payment_token_address = payment_token_address;
    }
  }

  @unmanaged
  export class authorize_registration_res {
    static encode(message: authorize_registration_res, writer: Writer): void {
      if (message.value != 0) {
        writer.uint32(8);
        writer.uint64(message.value);
      }
    }

    static decode(reader: Reader, length: i32): authorize_registration_res {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_registration_res();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: u64;

    constructor(value: u64 = 0) {
      this.value = value;
    }
  }
}
