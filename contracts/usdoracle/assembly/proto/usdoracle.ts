import { Writer, Reader } from "as-proto";

export namespace usdoracle {
  export class hello_arguments {
    static encode(message: hello_arguments, writer: Writer): void {
      if (message.name.length != 0) {
        writer.uint32(10);
        writer.string(message.name);
      }
    }

    static decode(reader: Reader, length: i32): hello_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new hello_arguments();

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

  export class hello_result {
    static encode(message: hello_result, writer: Writer): void {
      if (message.value.length != 0) {
        writer.uint32(10);
        writer.string(message.value);
      }
    }

    static decode(reader: Reader, length: i32): hello_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new hello_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: string;

    constructor(value: string = "") {
      this.value = value;
    }
  }
}
