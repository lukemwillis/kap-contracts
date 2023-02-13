import { Writer, Reader } from "as-proto";

export namespace usdoracle {
  export class set_latest_price_arguments {
    static encode(message: set_latest_price_arguments, writer: Writer): void {
      if (message.token_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.token_address);
      }

      if (message.price != 0) {
        writer.uint32(16);
        writer.uint64(message.price);
      }
    }

    static decode(reader: Reader, length: i32): set_latest_price_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_latest_price_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_address = reader.bytes();
            break;

          case 2:
            message.price = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_address: Uint8Array;
    price: u64;

    constructor(token_address: Uint8Array = new Uint8Array(0), price: u64 = 0) {
      this.token_address = token_address;
      this.price = price;
    }
  }

  export class get_latest_price_arguments {
    static encode(message: get_latest_price_arguments, writer: Writer): void {
      if (message.token_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.token_address);
      }
    }

    static decode(reader: Reader, length: i32): get_latest_price_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_latest_price_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_address = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_address: Uint8Array;

    constructor(token_address: Uint8Array = new Uint8Array(0)) {
      this.token_address = token_address;
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

  @unmanaged
  export class price_object {
    static encode(message: price_object, writer: Writer): void {
      if (message.price != 0) {
        writer.uint32(8);
        writer.uint64(message.price);
      }

      if (message.timestamp != 0) {
        writer.uint32(16);
        writer.uint64(message.timestamp);
      }
    }

    static decode(reader: Reader, length: i32): price_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new price_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.price = reader.uint64();
            break;

          case 2:
            message.timestamp = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    price: u64;
    timestamp: u64;

    constructor(price: u64 = 0, timestamp: u64 = 0) {
      this.price = price;
      this.timestamp = timestamp;
    }
  }
}
