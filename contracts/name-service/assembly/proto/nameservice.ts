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

      if (message.oracle_address.length != 0) {
        writer.uint32(26);
        writer.bytes(message.oracle_address);
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

          case 3:
            message.oracle_address = reader.bytes();
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
    oracle_address: Uint8Array;

    constructor(
      tla_registration_fee: u64 = 0,
      kap_token_address: Uint8Array = new Uint8Array(0),
      oracle_address: Uint8Array = new Uint8Array(0)
    ) {
      this.tla_registration_fee = tla_registration_fee;
      this.kap_token_address = kap_token_address;
      this.oracle_address = oracle_address;
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

      const unique_name_rules = message.rules;
      if (unique_name_rules !== null) {
        writer.uint32(42);
        writer.fork();
        domain_rules_object.encode(unique_name_rules, writer);
        writer.ldelim();
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
            message.rules = domain_rules_object.decode(reader, reader.uint32());
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
    rules: domain_rules_object | null;

    constructor(
      domain: string = "",
      name: string = "",
      owner: Uint8Array = new Uint8Array(0),
      expiration: u64 = 0,
      rules: domain_rules_object | null = null
    ) {
      this.domain = domain;
      this.name = name;
      this.owner = owner;
      this.expiration = expiration;
      this.rules = rules;
    }
  }

  export class domain_rules_object {
    static encode(message: domain_rules_object, writer: Writer): void {
      if (message.is_mintable != false) {
        writer.uint32(8);
        writer.bool(message.is_mintable);
      }

      if (message.days_per_increment != 0) {
        writer.uint32(16);
        writer.uint32(message.days_per_increment);
      }

      const unique_name_pricings = message.pricings;
      for (let i = 0; i < unique_name_pricings.length; ++i) {
        writer.uint32(26);
        writer.fork();
        pricing_object.encode(unique_name_pricings[i], writer);
        writer.ldelim();
      }

      const unique_name_allowed_payment_tokens = message.allowed_payment_tokens;
      if (unique_name_allowed_payment_tokens.length !== 0) {
        for (let i = 0; i < unique_name_allowed_payment_tokens.length; ++i) {
          writer.uint32(34);
          writer.bytes(unique_name_allowed_payment_tokens[i]);
        }
      }
    }

    static decode(reader: Reader, length: i32): domain_rules_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new domain_rules_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.is_mintable = reader.bool();
            break;

          case 2:
            message.days_per_increment = reader.uint32();
            break;

          case 3:
            message.pricings.push(
              pricing_object.decode(reader, reader.uint32())
            );
            break;

          case 4:
            message.allowed_payment_tokens.push(reader.bytes());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    is_mintable: bool;
    days_per_increment: u32;
    pricings: Array<pricing_object>;
    allowed_payment_tokens: Array<Uint8Array>;

    constructor(
      is_mintable: bool = false,
      days_per_increment: u32 = 0,
      pricings: Array<pricing_object> = [],
      allowed_payment_tokens: Array<Uint8Array> = []
    ) {
      this.is_mintable = is_mintable;
      this.days_per_increment = days_per_increment;
      this.pricings = pricings;
      this.allowed_payment_tokens = allowed_payment_tokens;
    }
  }

  @unmanaged
  export class pricing_object {
    static encode(message: pricing_object, writer: Writer): void {
      if (message.number_characters_from != 0) {
        writer.uint32(8);
        writer.uint32(message.number_characters_from);
      }

      if (message.number_characters_to != 0) {
        writer.uint32(16);
        writer.uint32(message.number_characters_to);
      }

      if (message.price_per_increment != 0) {
        writer.uint32(24);
        writer.uint64(message.price_per_increment);
      }
    }

    static decode(reader: Reader, length: i32): pricing_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new pricing_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.number_characters_from = reader.uint32();
            break;

          case 2:
            message.number_characters_to = reader.uint32();
            break;

          case 3:
            message.price_per_increment = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    number_characters_from: u32;
    number_characters_to: u32;
    price_per_increment: u64;

    constructor(
      number_characters_from: u32 = 0,
      number_characters_to: u32 = 0,
      price_per_increment: u64 = 0
    ) {
      this.number_characters_from = number_characters_from;
      this.number_characters_to = number_characters_to;
      this.price_per_increment = price_per_increment;
    }
  }

  export class get_usd_price_args {
    static encode(message: get_usd_price_args, writer: Writer): void {
      if (message.token_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.token_address);
      }
    }

    static decode(reader: Reader, length: i32): get_usd_price_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_usd_price_args();

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
  export class get_usd_price_res {
    static encode(message: get_usd_price_res, writer: Writer): void {
      if (message.value != 0) {
        writer.uint32(8);
        writer.uint64(message.value);
      }
    }

    static decode(reader: Reader, length: i32): get_usd_price_res {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_usd_price_res();

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
