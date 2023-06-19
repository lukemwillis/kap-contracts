import { Writer, Reader } from "as-proto";

export namespace koindomain {
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

      if (message.data.length != 0) {
        writer.uint32(58);
        writer.bytes(message.data);
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

    name: string;
    domain: string;
    duration_increments: u32;
    owner: Uint8Array;
    payment_from: Uint8Array;
    payment_token_address: Uint8Array;
    data: Uint8Array;

    constructor(
      name: string = "",
      domain: string = "",
      duration_increments: u32 = 0,
      owner: Uint8Array = new Uint8Array(0),
      payment_from: Uint8Array = new Uint8Array(0),
      payment_token_address: Uint8Array = new Uint8Array(0),
      data: Uint8Array = new Uint8Array(0)
    ) {
      this.name = name;
      this.domain = domain;
      this.duration_increments = duration_increments;
      this.owner = owner;
      this.payment_from = payment_from;
      this.payment_token_address = payment_token_address;
      this.data = data;
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

  export class get_purchases_arguments {
    static encode(message: get_purchases_arguments, writer: Writer): void {
      if (message.name.length != 0) {
        writer.uint32(10);
        writer.string(message.name);
      }

      if (message.timestamp != 0) {
        writer.uint32(16);
        writer.uint64(message.timestamp);
      }

      if (message.limit != 0) {
        writer.uint32(24);
        writer.uint32(message.limit);
      }

      if (message.descending != false) {
        writer.uint32(32);
        writer.bool(message.descending);
      }
    }

    static decode(reader: Reader, length: i32): get_purchases_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_purchases_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.name = reader.string();
            break;

          case 2:
            message.timestamp = reader.uint64();
            break;

          case 3:
            message.limit = reader.uint32();
            break;

          case 4:
            message.descending = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    name: string;
    timestamp: u64;
    limit: u32;
    descending: bool;

    constructor(
      name: string = "",
      timestamp: u64 = 0,
      limit: u32 = 0,
      descending: bool = false
    ) {
      this.name = name;
      this.timestamp = timestamp;
      this.limit = limit;
      this.descending = descending;
    }
  }

  export class get_purchases_result {
    static encode(message: get_purchases_result, writer: Writer): void {
      const unique_name_purchases = message.purchases;
      for (let i = 0; i < unique_name_purchases.length; ++i) {
        writer.uint32(10);
        writer.fork();
        purchase_object.encode(unique_name_purchases[i], writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): get_purchases_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_purchases_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.purchases.push(
              purchase_object.decode(reader, reader.uint32())
            );
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    purchases: Array<purchase_object>;

    constructor(purchases: Array<purchase_object> = []) {
      this.purchases = purchases;
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

  export class get_last_usd_price_args {
    static encode(message: get_last_usd_price_args, writer: Writer): void {
      if (message.token_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.token_address);
      }
    }

    static decode(reader: Reader, length: i32): get_last_usd_price_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_last_usd_price_args();

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
  export class get_last_usd_price_res {
    static encode(message: get_last_usd_price_res, writer: Writer): void {
      if (message.price != 0) {
        writer.uint32(8);
        writer.uint64(message.price);
      }

      if (message.timestamp != 0) {
        writer.uint32(16);
        writer.uint64(message.timestamp);
      }
    }

    static decode(reader: Reader, length: i32): get_last_usd_price_res {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_last_usd_price_res();

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

  export class balance_of_nft_args {
    static encode(message: balance_of_nft_args, writer: Writer): void {
      if (message.owner.length != 0) {
        writer.uint32(10);
        writer.bytes(message.owner);
      }
    }

    static decode(reader: Reader, length: i32): balance_of_nft_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new balance_of_nft_args();

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
  export class balance_of_nft_res {
    static encode(message: balance_of_nft_res, writer: Writer): void {
      if (message.value != 0) {
        writer.uint32(8);
        writer.uint64(message.value);
      }
    }

    static decode(reader: Reader, length: i32): balance_of_nft_res {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new balance_of_nft_res();

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

  export class metadata_object {
    static encode(message: metadata_object, writer: Writer): void {
      if (message.nameservice_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.nameservice_address);
      }

      if (message.oracle_address.length != 0) {
        writer.uint32(18);
        writer.bytes(message.oracle_address);
      }

      if (message.owner.length != 0) {
        writer.uint32(26);
        writer.bytes(message.owner);
      }

      if (message.press_badge_address.length != 0) {
        writer.uint32(34);
        writer.bytes(message.press_badge_address);
      }

      if (message.is_launched != false) {
        writer.uint32(40);
        writer.bool(message.is_launched);
      }

      if (message.beneficiary.length != 0) {
        writer.uint32(50);
        writer.bytes(message.beneficiary);
      }

      if (message.referral_contract_address.length != 0) {
        writer.uint32(58);
        writer.bytes(message.referral_contract_address);
      }

      if (message.referrals_refresh_period != 0) {
        writer.uint32(64);
        writer.uint64(message.referrals_refresh_period);
      }

      if (message.max_referrals_per_period != 0) {
        writer.uint32(72);
        writer.uint64(message.max_referrals_per_period);
      }

      if (message.premium_account_referral_discount_percent != 0) {
        writer.uint32(80);
        writer.uint32(message.premium_account_referral_discount_percent);
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
            message.oracle_address = reader.bytes();
            break;

          case 3:
            message.owner = reader.bytes();
            break;

          case 4:
            message.press_badge_address = reader.bytes();
            break;

          case 5:
            message.is_launched = reader.bool();
            break;

          case 6:
            message.beneficiary = reader.bytes();
            break;

          case 7:
            message.referral_contract_address = reader.bytes();
            break;

          case 8:
            message.referrals_refresh_period = reader.uint64();
            break;

          case 9:
            message.max_referrals_per_period = reader.uint64();
            break;

          case 10:
            message.premium_account_referral_discount_percent = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    nameservice_address: Uint8Array;
    oracle_address: Uint8Array;
    owner: Uint8Array;
    press_badge_address: Uint8Array;
    is_launched: bool;
    beneficiary: Uint8Array;
    referral_contract_address: Uint8Array;
    referrals_refresh_period: u64;
    max_referrals_per_period: u64;
    premium_account_referral_discount_percent: u32;

    constructor(
      nameservice_address: Uint8Array = new Uint8Array(0),
      oracle_address: Uint8Array = new Uint8Array(0),
      owner: Uint8Array = new Uint8Array(0),
      press_badge_address: Uint8Array = new Uint8Array(0),
      is_launched: bool = false,
      beneficiary: Uint8Array = new Uint8Array(0),
      referral_contract_address: Uint8Array = new Uint8Array(0),
      referrals_refresh_period: u64 = 0,
      max_referrals_per_period: u64 = 0,
      premium_account_referral_discount_percent: u32 = 0
    ) {
      this.nameservice_address = nameservice_address;
      this.oracle_address = oracle_address;
      this.owner = owner;
      this.press_badge_address = press_badge_address;
      this.is_launched = is_launched;
      this.beneficiary = beneficiary;
      this.referral_contract_address = referral_contract_address;
      this.referrals_refresh_period = referrals_refresh_period;
      this.max_referrals_per_period = max_referrals_per_period;
      this.premium_account_referral_discount_percent =
        premium_account_referral_discount_percent;
    }
  }

  export class purchase_object {
    static encode(message: purchase_object, writer: Writer): void {
      if (message.buyer.length != 0) {
        writer.uint32(10);
        writer.bytes(message.buyer);
      }

      if (message.name.length != 0) {
        writer.uint32(18);
        writer.string(message.name);
      }

      if (message.usd_amount != 0) {
        writer.uint32(24);
        writer.uint64(message.usd_amount);
      }

      if (message.timestamp != 0) {
        writer.uint32(32);
        writer.uint64(message.timestamp);
      }
    }

    static decode(reader: Reader, length: i32): purchase_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new purchase_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.buyer = reader.bytes();
            break;

          case 2:
            message.name = reader.string();
            break;

          case 3:
            message.usd_amount = reader.uint64();
            break;

          case 4:
            message.timestamp = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    buyer: Uint8Array;
    name: string;
    usd_amount: u64;
    timestamp: u64;

    constructor(
      buyer: Uint8Array = new Uint8Array(0),
      name: string = "",
      usd_amount: u64 = 0,
      timestamp: u64 = 0
    ) {
      this.buyer = buyer;
      this.name = name;
      this.usd_amount = usd_amount;
      this.timestamp = timestamp;
    }
  }

  export class purchase_key {
    static encode(message: purchase_key, writer: Writer): void {
      if (message.name.length != 0) {
        writer.uint32(10);
        writer.string(message.name);
      }

      if (message.timestamp != 0) {
        writer.uint32(16);
        writer.uint64(message.timestamp);
      }
    }

    static decode(reader: Reader, length: i32): purchase_key {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new purchase_key();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.name = reader.string();
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

    name: string;
    timestamp: u64;

    constructor(name: string = "", timestamp: u64 = 0) {
      this.name = name;
      this.timestamp = timestamp;
    }
  }

  export class purchase_record {
    static encode(message: purchase_record, writer: Writer): void {
      if (message.buyer.length != 0) {
        writer.uint32(10);
        writer.bytes(message.buyer);
      }

      if (message.usd_amount != 0) {
        writer.uint32(16);
        writer.uint64(message.usd_amount);
      }
    }

    static decode(reader: Reader, length: i32): purchase_record {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new purchase_record();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.buyer = reader.bytes();
            break;

          case 2:
            message.usd_amount = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    buyer: Uint8Array;
    usd_amount: u64;

    constructor(buyer: Uint8Array = new Uint8Array(0), usd_amount: u64 = 0) {
      this.buyer = buyer;
      this.usd_amount = usd_amount;
    }
  }

  export class get_name_args {
    static encode(message: get_name_args, writer: Writer): void {
      if (message.name.length != 0) {
        writer.uint32(10);
        writer.string(message.name);
      }
    }

    static decode(reader: Reader, length: i32): get_name_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_name_args();

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
  export class referral_allowance {
    static encode(message: referral_allowance, writer: Writer): void {
      if (message.max_amount != 0) {
        writer.uint32(8);
        writer.uint64(message.max_amount);
      }

      if (message.remaining != 0) {
        writer.uint32(16);
        writer.uint64(message.remaining);
      }

      if (message.next_refresh != 0) {
        writer.uint32(24);
        writer.uint64(message.next_refresh);
      }
    }

    static decode(reader: Reader, length: i32): referral_allowance {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new referral_allowance();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.max_amount = reader.uint64();
            break;

          case 2:
            message.remaining = reader.uint64();
            break;

          case 3:
            message.next_refresh = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    max_amount: u64;
    remaining: u64;
    next_refresh: u64;

    constructor(
      max_amount: u64 = 0,
      remaining: u64 = 0,
      next_refresh: u64 = 0
    ) {
      this.max_amount = max_amount;
      this.remaining = remaining;
      this.next_refresh = next_refresh;
    }
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

  export class redeem_referral_code_args {
    static encode(message: redeem_referral_code_args, writer: Writer): void {
      const unique_name_referral_code = message.referral_code;
      if (unique_name_referral_code !== null) {
        writer.uint32(10);
        writer.fork();
        referral_code.encode(unique_name_referral_code, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): redeem_referral_code_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new redeem_referral_code_args();

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
}
