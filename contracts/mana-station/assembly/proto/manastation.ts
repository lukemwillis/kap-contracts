import { Writer, Reader } from "as-proto";

export namespace manastation {
  export class set_metadata_arguments {
    static encode(message: set_metadata_arguments, writer: Writer): void {
      if (message.nameservice_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.nameservice_address);
      }

      if (message.max_rc_limit != 0) {
        writer.uint32(16);
        writer.uint64(message.max_rc_limit);
      }
    }

    static decode(reader: Reader, length: i32): set_metadata_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_metadata_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.nameservice_address = reader.bytes();
            break;

          case 2:
            message.max_rc_limit = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    nameservice_address: Uint8Array;
    max_rc_limit: u64;

    constructor(
      nameservice_address: Uint8Array = new Uint8Array(0),
      max_rc_limit: u64 = 0
    ) {
      this.nameservice_address = nameservice_address;
      this.max_rc_limit = max_rc_limit;
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

  export class balance_of_args {
    static encode(message: balance_of_args, writer: Writer): void {
      if (message.owner.length != 0) {
        writer.uint32(10);
        writer.bytes(message.owner);
      }
    }

    static decode(reader: Reader, length: i32): balance_of_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new balance_of_args();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.owner = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    owner: Uint8Array;

    constructor(owner: Uint8Array = new Uint8Array(0)) {
      this.owner = owner;
    }
  }

  @unmanaged
  export class balance_of_res {
    static encode(message: balance_of_res, writer: Writer): void {
      if (message.value != 0) {
        writer.uint32(8);
        writer.uint64(message.value);
      }
    }

    static decode(reader: Reader, length: i32): balance_of_res {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new balance_of_res();

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
      if (message.nameservice_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.nameservice_address);
      }

      if (message.max_rc_limit != 0) {
        writer.uint32(16);
        writer.uint64(message.max_rc_limit);
      }
    }

    static decode(reader: Reader, length: i32): metadata_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new metadata_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.nameservice_address = reader.bytes();
            break;

          case 2:
            message.max_rc_limit = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    nameservice_address: Uint8Array;
    max_rc_limit: u64;

    constructor(
      nameservice_address: Uint8Array = new Uint8Array(0),
      max_rc_limit: u64 = 0
    ) {
      this.nameservice_address = nameservice_address;
      this.max_rc_limit = max_rc_limit;
    }
  }
}
