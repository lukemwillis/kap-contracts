import { Writer, Reader } from "as-proto";

export namespace referral {
  export class redeem_arguments {
    static encode(message: redeem_arguments, writer: Writer): void {
      const unique_name_referral_code = message.referral_code;
      if (unique_name_referral_code !== null) {
        writer.uint32(10);
        writer.fork();
        referral_code.encode(unique_name_referral_code, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): redeem_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new redeem_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.referral_code = referral_code.decode(
              reader,
              reader.uint32()
            );
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    referral_code: referral_code | null;

    constructor(referral_code: referral_code | null = null) {
      this.referral_code = referral_code;
    }
  }

  export class get_referral_code_arguments {
    static encode(message: get_referral_code_arguments, writer: Writer): void {
      const unique_name_referral_code = message.referral_code;
      if (unique_name_referral_code !== null) {
        writer.uint32(10);
        writer.fork();
        referral_code.encode(unique_name_referral_code, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): get_referral_code_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_referral_code_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.referral_code = referral_code.decode(
              reader,
              reader.uint32()
            );
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    referral_code: referral_code | null;

    constructor(referral_code: referral_code | null = null) {
      this.referral_code = referral_code;
    }
  }

  @unmanaged
  export class empty_message {
    static encode(message: empty_message, writer: Writer): void {}

    static decode(reader: Reader, length: i32): empty_message {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new empty_message();

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

  export class referral_code_metadata {
    static encode(message: referral_code_metadata, writer: Writer): void {
      if (message.chain_id.length != 0) {
        writer.uint32(10);
        writer.bytes(message.chain_id);
      }

      if (message.issuer.length != 0) {
        writer.uint32(18);
        writer.bytes(message.issuer);
      }

      if (message.issuance_date != 0) {
        writer.uint32(24);
        writer.uint64(message.issuance_date);
      }

      if (message.expiration_date != 0) {
        writer.uint32(32);
        writer.uint64(message.expiration_date);
      }

      if (message.allowed_redemption_contract.length != 0) {
        writer.uint32(42);
        writer.bytes(message.allowed_redemption_contract);
      }

      if (message.allowed_redemption_account.length != 0) {
        writer.uint32(50);
        writer.bytes(message.allowed_redemption_account);
      }

      if (message.data.length != 0) {
        writer.uint32(58);
        writer.bytes(message.data);
      }
    }

    static decode(reader: Reader, length: i32): referral_code_metadata {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new referral_code_metadata();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.chain_id = reader.bytes();
            break;

          case 2:
            message.issuer = reader.bytes();
            break;

          case 3:
            message.issuance_date = reader.uint64();
            break;

          case 4:
            message.expiration_date = reader.uint64();
            break;

          case 5:
            message.allowed_redemption_contract = reader.bytes();
            break;

          case 6:
            message.allowed_redemption_account = reader.bytes();
            break;

          case 7:
            message.data = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    chain_id: Uint8Array;
    issuer: Uint8Array;
    issuance_date: u64;
    expiration_date: u64;
    allowed_redemption_contract: Uint8Array;
    allowed_redemption_account: Uint8Array;
    data: Uint8Array;

    constructor(
      chain_id: Uint8Array = new Uint8Array(0),
      issuer: Uint8Array = new Uint8Array(0),
      issuance_date: u64 = 0,
      expiration_date: u64 = 0,
      allowed_redemption_contract: Uint8Array = new Uint8Array(0),
      allowed_redemption_account: Uint8Array = new Uint8Array(0),
      data: Uint8Array = new Uint8Array(0)
    ) {
      this.chain_id = chain_id;
      this.issuer = issuer;
      this.issuance_date = issuance_date;
      this.expiration_date = expiration_date;
      this.allowed_redemption_contract = allowed_redemption_contract;
      this.allowed_redemption_account = allowed_redemption_account;
      this.data = data;
    }
  }

  export class referral_code {
    static encode(message: referral_code, writer: Writer): void {
      const unique_name_metadata = message.metadata;
      if (unique_name_metadata !== null) {
        writer.uint32(10);
        writer.fork();
        referral_code_metadata.encode(unique_name_metadata, writer);
        writer.ldelim();
      }

      if (message.signature.length != 0) {
        writer.uint32(18);
        writer.bytes(message.signature);
      }
    }

    static decode(reader: Reader, length: i32): referral_code {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new referral_code();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.metadata = referral_code_metadata.decode(
              reader,
              reader.uint32()
            );
            break;

          case 2:
            message.signature = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    metadata: referral_code_metadata | null;
    signature: Uint8Array;

    constructor(
      metadata: referral_code_metadata | null = null,
      signature: Uint8Array = new Uint8Array(0)
    ) {
      this.metadata = metadata;
      this.signature = signature;
    }
  }
}
