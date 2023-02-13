import { Writer, Reader } from "as-proto";

export namespace multisig {
  export class add_signer_arguments {
    static encode(message: add_signer_arguments, writer: Writer): void {
      if (message.signer.length != 0) {
        writer.uint32(10);
        writer.bytes(message.signer);
      }
    }

    static decode(reader: Reader, length: i32): add_signer_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new add_signer_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.signer = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    signer: Uint8Array;

    constructor(signer: Uint8Array = new Uint8Array(0)) {
      this.signer = signer;
    }
  }

  export class remove_signer_arguments {
    static encode(message: remove_signer_arguments, writer: Writer): void {
      if (message.signer.length != 0) {
        writer.uint32(10);
        writer.bytes(message.signer);
      }
    }

    static decode(reader: Reader, length: i32): remove_signer_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new remove_signer_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.signer = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    signer: Uint8Array;

    constructor(signer: Uint8Array = new Uint8Array(0)) {
      this.signer = signer;
    }
  }

  @unmanaged
  export class get_signers_arguments {
    static encode(message: get_signers_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): get_signers_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_signers_arguments();

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

  export class get_signers_result {
    static encode(message: get_signers_result, writer: Writer): void {
      const unique_name_authorized_signers = message.authorized_signers;
      if (unique_name_authorized_signers.length !== 0) {
        for (let i = 0; i < unique_name_authorized_signers.length; ++i) {
          writer.uint32(10);
          writer.bytes(unique_name_authorized_signers[i]);
        }
      }
    }

    static decode(reader: Reader, length: i32): get_signers_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_signers_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.authorized_signers.push(reader.bytes());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    authorized_signers: Array<Uint8Array>;

    constructor(authorized_signers: Array<Uint8Array> = []) {
      this.authorized_signers = authorized_signers;
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
  export class metadata_object {
    static encode(message: metadata_object, writer: Writer): void {
      if (message.number_authorized_signers != 0) {
        writer.uint32(8);
        writer.uint32(message.number_authorized_signers);
      }
    }

    static decode(reader: Reader, length: i32): metadata_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new metadata_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.number_authorized_signers = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    number_authorized_signers: u32;

    constructor(number_authorized_signers: u32 = 0) {
      this.number_authorized_signers = number_authorized_signers;
    }
  }
}
