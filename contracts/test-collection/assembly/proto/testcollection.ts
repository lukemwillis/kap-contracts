import { Writer, Reader } from "as-proto";

export namespace testcollection {
  export class mint_arguments {
    static encode(message: mint_arguments, writer: Writer): void {
      if (message.owner.length != 0) {
        writer.uint32(10);
        writer.bytes(message.owner);
      }

      if (message.token_id.length != 0) {
        writer.uint32(18);
        writer.bytes(message.token_id);
      }
    }

    static decode(reader: Reader, length: i32): mint_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new mint_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.owner = reader.bytes();
            break;

          case 2:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    owner: Uint8Array;
    token_id: Uint8Array;

    constructor(
      owner: Uint8Array = new Uint8Array(0),
      token_id: Uint8Array = new Uint8Array(0)
    ) {
      this.owner = owner;
      this.token_id = token_id;
    }
  }

  export class transfer_arguments {
    static encode(message: transfer_arguments, writer: Writer): void {
      if (message.from.length != 0) {
        writer.uint32(10);
        writer.bytes(message.from);
      }

      if (message.to.length != 0) {
        writer.uint32(18);
        writer.bytes(message.to);
      }

      if (message.token_id.length != 0) {
        writer.uint32(26);
        writer.bytes(message.token_id);
      }
    }

    static decode(reader: Reader, length: i32): transfer_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new transfer_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.from = reader.bytes();
            break;

          case 2:
            message.to = reader.bytes();
            break;

          case 3:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    from: Uint8Array;
    to: Uint8Array;
    token_id: Uint8Array;

    constructor(
      from: Uint8Array = new Uint8Array(0),
      to: Uint8Array = new Uint8Array(0),
      token_id: Uint8Array = new Uint8Array(0)
    ) {
      this.from = from;
      this.to = to;
      this.token_id = token_id;
    }
  }

  export class owner_of_arguments {
    static encode(message: owner_of_arguments, writer: Writer): void {
      if (message.token_id.length != 0) {
        writer.uint32(10);
        writer.bytes(message.token_id);
      }
    }

    static decode(reader: Reader, length: i32): owner_of_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new owner_of_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_id: Uint8Array;

    constructor(token_id: Uint8Array = new Uint8Array(0)) {
      this.token_id = token_id;
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

  export class owner_object {
    static encode(message: owner_object, writer: Writer): void {
      if (message.owner.length != 0) {
        writer.uint32(10);
        writer.bytes(message.owner);
      }
    }

    static decode(reader: Reader, length: i32): owner_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new owner_object();

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
}
