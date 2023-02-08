import { Writer, Reader } from "as-proto";

export namespace testdomain {
  export class authorize_mint_arguments {
    static encode(message: authorize_mint_arguments, writer: Writer): void {
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

    static decode(reader: Reader, length: i32): authorize_mint_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_mint_arguments();

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
  export class authorize_mint_result {
    static encode(message: authorize_mint_result, writer: Writer): void {
      if (message.expiration != 0) {
        writer.uint32(8);
        writer.uint64(message.expiration);
      }

      if (message.grace_period_end != 0) {
        writer.uint32(16);
        writer.uint64(message.grace_period_end);
      }
    }

    static decode(reader: Reader, length: i32): authorize_mint_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_mint_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.expiration = reader.uint64();
            break;

          case 2:
            message.grace_period_end = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    expiration: u64;
    grace_period_end: u64;

    constructor(expiration: u64 = 0, grace_period_end: u64 = 0) {
      this.expiration = expiration;
      this.grace_period_end = grace_period_end;
    }
  }

  export class authorize_burn_arguments {
    static encode(message: authorize_burn_arguments, writer: Writer): void {
      const unique_name_name = message.name;
      if (unique_name_name !== null) {
        writer.uint32(10);
        writer.fork();
        name_object.encode(unique_name_name, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): authorize_burn_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_burn_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.name = name_object.decode(reader, reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    name: name_object | null;

    constructor(name: name_object | null = null) {
      this.name = name;
    }
  }

  @unmanaged
  export class authorize_burn_result {
    static encode(message: authorize_burn_result, writer: Writer): void {
      if (message.authorized != false) {
        writer.uint32(8);
        writer.bool(message.authorized);
      }
    }

    static decode(reader: Reader, length: i32): authorize_burn_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_burn_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.authorized = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    authorized: bool;

    constructor(authorized: bool = false) {
      this.authorized = authorized;
    }
  }

  export class authorize_renewal_arguments {
    static encode(message: authorize_renewal_arguments, writer: Writer): void {
      const unique_name_name = message.name;
      if (unique_name_name !== null) {
        writer.uint32(10);
        writer.fork();
        name_object.encode(unique_name_name, writer);
        writer.ldelim();
      }

      if (message.duration_increments != 0) {
        writer.uint32(16);
        writer.uint32(message.duration_increments);
      }

      if (message.payment_from.length != 0) {
        writer.uint32(26);
        writer.bytes(message.payment_from);
      }

      if (message.payment_token_address.length != 0) {
        writer.uint32(34);
        writer.bytes(message.payment_token_address);
      }
    }

    static decode(reader: Reader, length: i32): authorize_renewal_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_renewal_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.name = name_object.decode(reader, reader.uint32());
            break;

          case 2:
            message.duration_increments = reader.uint32();
            break;

          case 3:
            message.payment_from = reader.bytes();
            break;

          case 4:
            message.payment_token_address = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    name: name_object | null;
    duration_increments: u32;
    payment_from: Uint8Array;
    payment_token_address: Uint8Array;

    constructor(
      name: name_object | null = null,
      duration_increments: u32 = 0,
      payment_from: Uint8Array = new Uint8Array(0),
      payment_token_address: Uint8Array = new Uint8Array(0)
    ) {
      this.name = name;
      this.duration_increments = duration_increments;
      this.payment_from = payment_from;
      this.payment_token_address = payment_token_address;
    }
  }

  @unmanaged
  export class authorize_renewal_result {
    static encode(message: authorize_renewal_result, writer: Writer): void {
      if (message.expiration != 0) {
        writer.uint32(8);
        writer.uint64(message.expiration);
      }

      if (message.grace_period_end != 0) {
        writer.uint32(16);
        writer.uint64(message.grace_period_end);
      }
    }

    static decode(reader: Reader, length: i32): authorize_renewal_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_renewal_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.expiration = reader.uint64();
            break;

          case 2:
            message.grace_period_end = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    expiration: u64;
    grace_period_end: u64;

    constructor(expiration: u64 = 0, grace_period_end: u64 = 0) {
      this.expiration = expiration;
      this.grace_period_end = grace_period_end;
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

      if (message.grace_period_end != 0) {
        writer.uint32(40);
        writer.uint64(message.grace_period_end);
      }

      if (message.sub_names_count != 0) {
        writer.uint32(48);
        writer.uint64(message.sub_names_count);
      }

      if (message.locked_kap_tokens != 0) {
        writer.uint32(56);
        writer.uint64(message.locked_kap_tokens);
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

          case 5:
            message.grace_period_end = reader.uint64();
            break;

          case 6:
            message.sub_names_count = reader.uint64();
            break;

          case 7:
            message.locked_kap_tokens = reader.uint64();
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
    grace_period_end: u64;
    sub_names_count: u64;
    locked_kap_tokens: u64;

    constructor(
      domain: string = "",
      name: string = "",
      owner: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0,
      grace_period_end: u64 = 0,
      sub_names_count: u64 = 0,
      locked_kap_tokens: u64 = 0
    ) {
      this.domain = domain;
      this.name = name;
      this.owner = owner;
      this.expiration = expiration;
      this.grace_period_end = grace_period_end;
      this.sub_names_count = sub_names_count;
      this.locked_kap_tokens = locked_kap_tokens;
    }
  }
}
