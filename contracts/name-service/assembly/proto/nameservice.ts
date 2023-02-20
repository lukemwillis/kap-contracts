import { Writer, Reader } from "as-proto";

export namespace nameservice {
  @unmanaged
  export class name_arguments {
    static encode(message: name_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): name_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new name_arguments();

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
  export class symbol_arguments {
    static encode(message: symbol_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): symbol_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new symbol_arguments();

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
  export class uri_arguments {
    static encode(message: uri_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): uri_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new uri_arguments();

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
  export class total_supply_arguments {
    static encode(message: total_supply_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): total_supply_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new total_supply_arguments();

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
  export class royalties_arguments {
    static encode(message: royalties_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): royalties_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new royalties_arguments();

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

  export class royalties_result {
    static encode(message: royalties_result, writer: Writer): void {
      const unique_name_value = message.value;
      for (let i = 0; i < unique_name_value.length; ++i) {
        writer.uint32(10);
        writer.fork();
        royalty_object.encode(unique_name_value[i], writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): royalties_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new royalties_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value.push(royalty_object.decode(reader, reader.uint32()));
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Array<royalty_object>;

    constructor(value: Array<royalty_object> = []) {
      this.value = value;
    }
  }

  export class set_royalties_arguments {
    static encode(message: set_royalties_arguments, writer: Writer): void {
      const unique_name_value = message.value;
      for (let i = 0; i < unique_name_value.length; ++i) {
        writer.uint32(10);
        writer.fork();
        royalty_object.encode(unique_name_value[i], writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): set_royalties_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_royalties_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value.push(royalty_object.decode(reader, reader.uint32()));
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Array<royalty_object>;

    constructor(value: Array<royalty_object> = []) {
      this.value = value;
    }
  }

  @unmanaged
  export class owner_arguments {
    static encode(message: owner_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): owner_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new owner_arguments();

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

  export class transfer_ownership_arguments {
    static encode(message: transfer_ownership_arguments, writer: Writer): void {
      if (message.owner.length != 0) {
        writer.uint32(10);
        writer.bytes(message.owner);
      }
    }

    static decode(reader: Reader, length: i32): transfer_ownership_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new transfer_ownership_arguments();

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

  export class balance_of_arguments {
    static encode(message: balance_of_arguments, writer: Writer): void {
      if (message.owner.length != 0) {
        writer.uint32(10);
        writer.bytes(message.owner);
      }
    }

    static decode(reader: Reader, length: i32): balance_of_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new balance_of_arguments();

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

  export class get_approved_arguments {
    static encode(message: get_approved_arguments, writer: Writer): void {
      if (message.token_id.length != 0) {
        writer.uint32(10);
        writer.bytes(message.token_id);
      }
    }

    static decode(reader: Reader, length: i32): get_approved_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_approved_arguments();

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

  export class is_approved_for_all_arguments {
    static encode(
      message: is_approved_for_all_arguments,
      writer: Writer
    ): void {
      if (message.owner.length != 0) {
        writer.uint32(10);
        writer.bytes(message.owner);
      }

      if (message.operator.length != 0) {
        writer.uint32(18);
        writer.bytes(message.operator);
      }
    }

    static decode(reader: Reader, length: i32): is_approved_for_all_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new is_approved_for_all_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.owner = reader.bytes();
            break;

          case 2:
            message.operator = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    owner: Uint8Array;
    operator: Uint8Array;

    constructor(
      owner: Uint8Array = new Uint8Array(0),
      operator: Uint8Array = new Uint8Array(0)
    ) {
      this.owner = owner;
      this.operator = operator;
    }
  }

  export class mint_arguments {
    static encode(message: mint_arguments, writer: Writer): void {
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

    static decode(reader: Reader, length: i32): mint_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new mint_arguments();

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

  export class burn_arguments {
    static encode(message: burn_arguments, writer: Writer): void {
      if (message.from.length != 0) {
        writer.uint32(10);
        writer.bytes(message.from);
      }

      if (message.token_id.length != 0) {
        writer.uint32(18);
        writer.bytes(message.token_id);
      }
    }

    static decode(reader: Reader, length: i32): burn_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new burn_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.from = reader.bytes();
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

    from: Uint8Array;
    token_id: Uint8Array;

    constructor(
      from: Uint8Array = new Uint8Array(0),
      token_id: Uint8Array = new Uint8Array(0)
    ) {
      this.from = from;
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

  export class approve_arguments {
    static encode(message: approve_arguments, writer: Writer): void {
      if (message.approver_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.approver_address);
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

    static decode(reader: Reader, length: i32): approve_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new approve_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.approver_address = reader.bytes();
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

    approver_address: Uint8Array;
    to: Uint8Array;
    token_id: Uint8Array;

    constructor(
      approver_address: Uint8Array = new Uint8Array(0),
      to: Uint8Array = new Uint8Array(0),
      token_id: Uint8Array = new Uint8Array(0)
    ) {
      this.approver_address = approver_address;
      this.to = to;
      this.token_id = token_id;
    }
  }

  export class set_approval_for_all_arguments {
    static encode(
      message: set_approval_for_all_arguments,
      writer: Writer
    ): void {
      if (message.approver_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.approver_address);
      }

      if (message.operator_address.length != 0) {
        writer.uint32(18);
        writer.bytes(message.operator_address);
      }

      if (message.approved != false) {
        writer.uint32(24);
        writer.bool(message.approved);
      }
    }

    static decode(reader: Reader, length: i32): set_approval_for_all_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_approval_for_all_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.approver_address = reader.bytes();
            break;

          case 2:
            message.operator_address = reader.bytes();
            break;

          case 3:
            message.approved = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    approver_address: Uint8Array;
    operator_address: Uint8Array;
    approved: bool;

    constructor(
      approver_address: Uint8Array = new Uint8Array(0),
      operator_address: Uint8Array = new Uint8Array(0),
      approved: bool = false
    ) {
      this.approver_address = approver_address;
      this.operator_address = operator_address;
      this.approved = approved;
    }
  }

  export class renew_arguments {
    static encode(message: renew_arguments, writer: Writer): void {
      if (message.name.length != 0) {
        writer.uint32(10);
        writer.string(message.name);
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

    static decode(reader: Reader, length: i32): renew_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new renew_arguments();

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

    name: string;
    duration_increments: u32;
    payment_from: Uint8Array;
    payment_token_address: Uint8Array;

    constructor(
      name: string = "",
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

  export class get_names_arguments {
    static encode(message: get_names_arguments, writer: Writer): void {
      if (message.owner.length != 0) {
        writer.uint32(10);
        writer.bytes(message.owner);
      }

      if (message.name_offset.length != 0) {
        writer.uint32(18);
        writer.string(message.name_offset);
      }

      if (message.limit != 0) {
        writer.uint32(24);
        writer.uint64(message.limit);
      }

      if (message.descending != false) {
        writer.uint32(32);
        writer.bool(message.descending);
      }
    }

    static decode(reader: Reader, length: i32): get_names_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_names_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.owner = reader.bytes();
            break;

          case 2:
            message.name_offset = reader.string();
            break;

          case 3:
            message.limit = reader.uint64();
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

    owner: Uint8Array;
    name_offset: string;
    limit: u64;
    descending: bool;

    constructor(
      owner: Uint8Array = new Uint8Array(0),
      name_offset: string = "",
      limit: u64 = 0,
      descending: bool = false
    ) {
      this.owner = owner;
      this.name_offset = name_offset;
      this.limit = limit;
      this.descending = descending;
    }
  }

  export class get_names_result {
    static encode(message: get_names_result, writer: Writer): void {
      const unique_name_names = message.names;
      for (let i = 0; i < unique_name_names.length; ++i) {
        writer.uint32(10);
        writer.fork();
        name_object.encode(unique_name_names[i], writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): get_names_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_names_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.names.push(name_object.decode(reader, reader.uint32()));
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    names: Array<name_object>;

    constructor(names: Array<name_object> = []) {
      this.names = names;
    }
  }

  export class set_metadata_arguments {
    static encode(message: set_metadata_arguments, writer: Writer): void {
      if (message.tla_mint_fee != 0) {
        writer.uint32(8);
        writer.uint64(message.tla_mint_fee);
      }

      if (message.kap_token_address.length != 0) {
        writer.uint32(18);
        writer.bytes(message.kap_token_address);
      }

      if (message.owner.length != 0) {
        writer.uint32(26);
        writer.bytes(message.owner);
      }
    }

    static decode(reader: Reader, length: i32): set_metadata_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_metadata_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.tla_mint_fee = reader.uint64();
            break;

          case 2:
            message.kap_token_address = reader.bytes();
            break;

          case 3:
            message.owner = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    tla_mint_fee: u64;
    kap_token_address: Uint8Array;
    owner: Uint8Array;

    constructor(
      tla_mint_fee: u64 = 0,
      kap_token_address: Uint8Array = new Uint8Array(0),
      owner: Uint8Array = new Uint8Array(0)
    ) {
      this.tla_mint_fee = tla_mint_fee;
      this.kap_token_address = kap_token_address;
      this.owner = owner;
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

  export class mint_event {
    static encode(message: mint_event, writer: Writer): void {
      if (message.to.length != 0) {
        writer.uint32(10);
        writer.bytes(message.to);
      }

      if (message.token_id.length != 0) {
        writer.uint32(18);
        writer.bytes(message.token_id);
      }
    }

    static decode(reader: Reader, length: i32): mint_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new mint_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.to = reader.bytes();
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

    to: Uint8Array;
    token_id: Uint8Array;

    constructor(
      to: Uint8Array = new Uint8Array(0),
      token_id: Uint8Array = new Uint8Array(0)
    ) {
      this.to = to;
      this.token_id = token_id;
    }
  }

  export class burn_event {
    static encode(message: burn_event, writer: Writer): void {
      if (message.from.length != 0) {
        writer.uint32(10);
        writer.bytes(message.from);
      }

      if (message.token_id.length != 0) {
        writer.uint32(18);
        writer.bytes(message.token_id);
      }
    }

    static decode(reader: Reader, length: i32): burn_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new burn_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.from = reader.bytes();
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

    from: Uint8Array;
    token_id: Uint8Array;

    constructor(
      from: Uint8Array = new Uint8Array(0),
      token_id: Uint8Array = new Uint8Array(0)
    ) {
      this.from = from;
      this.token_id = token_id;
    }
  }

  export class transfer_event {
    static encode(message: transfer_event, writer: Writer): void {
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

    static decode(reader: Reader, length: i32): transfer_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new transfer_event();

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

  export class operator_approval_event {
    static encode(message: operator_approval_event, writer: Writer): void {
      if (message.approver_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.approver_address);
      }

      if (message.operator_address.length != 0) {
        writer.uint32(18);
        writer.bytes(message.operator_address);
      }

      if (message.approved != false) {
        writer.uint32(24);
        writer.bool(message.approved);
      }
    }

    static decode(reader: Reader, length: i32): operator_approval_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new operator_approval_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.approver_address = reader.bytes();
            break;

          case 2:
            message.operator_address = reader.bytes();
            break;

          case 3:
            message.approved = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    approver_address: Uint8Array;
    operator_address: Uint8Array;
    approved: bool;

    constructor(
      approver_address: Uint8Array = new Uint8Array(0),
      operator_address: Uint8Array = new Uint8Array(0),
      approved: bool = false
    ) {
      this.approver_address = approver_address;
      this.operator_address = operator_address;
      this.approved = approved;
    }
  }

  export class token_approval_event {
    static encode(message: token_approval_event, writer: Writer): void {
      if (message.approver_address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.approver_address);
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

    static decode(reader: Reader, length: i32): token_approval_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new token_approval_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.approver_address = reader.bytes();
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

    approver_address: Uint8Array;
    to: Uint8Array;
    token_id: Uint8Array;

    constructor(
      approver_address: Uint8Array = new Uint8Array(0),
      to: Uint8Array = new Uint8Array(0),
      token_id: Uint8Array = new Uint8Array(0)
    ) {
      this.approver_address = approver_address;
      this.to = to;
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

  export class string_object {
    static encode(message: string_object, writer: Writer): void {
      if (message.value.length != 0) {
        writer.uint32(10);
        writer.string(message.value);
      }
    }

    static decode(reader: Reader, length: i32): string_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new string_object();

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

  @unmanaged
  export class uint64_object {
    static encode(message: uint64_object, writer: Writer): void {
      if (message.value != 0) {
        writer.uint32(8);
        writer.uint64(message.value);
      }
    }

    static decode(reader: Reader, length: i32): uint64_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new uint64_object();

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
  export class bool_object {
    static encode(message: bool_object, writer: Writer): void {
      if (message.value != false) {
        writer.uint32(8);
        writer.bool(message.value);
      }
    }

    static decode(reader: Reader, length: i32): bool_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new bool_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: bool;

    constructor(value: bool = false) {
      this.value = value;
    }
  }

  export class bytes_address_object {
    static encode(message: bytes_address_object, writer: Writer): void {
      if (message.value.length != 0) {
        writer.uint32(18);
        writer.bytes(message.value);
      }
    }

    static decode(reader: Reader, length: i32): bytes_address_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new bytes_address_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 2:
            message.value = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Uint8Array;

    constructor(value: Uint8Array = new Uint8Array(0)) {
      this.value = value;
    }
  }

  export class royalty_object {
    static encode(message: royalty_object, writer: Writer): void {
      if (message.amount != 0) {
        writer.uint32(8);
        writer.uint64(message.amount);
      }

      if (message.address.length != 0) {
        writer.uint32(18);
        writer.bytes(message.address);
      }
    }

    static decode(reader: Reader, length: i32): royalty_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new royalty_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.amount = reader.uint64();
            break;

          case 2:
            message.address = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    amount: u64;
    address: Uint8Array;

    constructor(amount: u64 = 0, address: Uint8Array = new Uint8Array(0)) {
      this.amount = amount;
      this.address = address;
    }
  }

  export class token_approval_object {
    static encode(message: token_approval_object, writer: Writer): void {
      if (message.address.length != 0) {
        writer.uint32(10);
        writer.bytes(message.address);
      }
    }

    static decode(reader: Reader, length: i32): token_approval_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new token_approval_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.address = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    address: Uint8Array;

    constructor(address: Uint8Array = new Uint8Array(0)) {
      this.address = address;
    }
  }

  export class operator_approval_key {
    static encode(message: operator_approval_key, writer: Writer): void {
      if (message.approver.length != 0) {
        writer.uint32(10);
        writer.bytes(message.approver);
      }

      if (message.operator.length != 0) {
        writer.uint32(18);
        writer.bytes(message.operator);
      }
    }

    static decode(reader: Reader, length: i32): operator_approval_key {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new operator_approval_key();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.approver = reader.bytes();
            break;

          case 2:
            message.operator = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    approver: Uint8Array;
    operator: Uint8Array;

    constructor(
      approver: Uint8Array = new Uint8Array(0),
      operator: Uint8Array = new Uint8Array(0)
    ) {
      this.approver = approver;
      this.operator = operator;
    }
  }

  @unmanaged
  export class operator_approval_object {
    static encode(message: operator_approval_object, writer: Writer): void {
      if (message.approved != false) {
        writer.uint32(8);
        writer.bool(message.approved);
      }
    }

    static decode(reader: Reader, length: i32): operator_approval_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new operator_approval_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.approved = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    approved: bool;

    constructor(approved: bool = false) {
      this.approved = approved;
    }
  }

  export class metadata_object {
    static encode(message: metadata_object, writer: Writer): void {
      if (message.tla_mint_fee != 0) {
        writer.uint32(8);
        writer.uint64(message.tla_mint_fee);
      }

      if (message.kap_token_address.length != 0) {
        writer.uint32(18);
        writer.bytes(message.kap_token_address);
      }

      if (message.owner.length != 0) {
        writer.uint32(26);
        writer.bytes(message.owner);
      }
    }

    static decode(reader: Reader, length: i32): metadata_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new metadata_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.tla_mint_fee = reader.uint64();
            break;

          case 2:
            message.kap_token_address = reader.bytes();
            break;

          case 3:
            message.owner = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    tla_mint_fee: u64;
    kap_token_address: Uint8Array;
    owner: Uint8Array;

    constructor(
      tla_mint_fee: u64 = 0,
      kap_token_address: Uint8Array = new Uint8Array(0),
      owner: Uint8Array = new Uint8Array(0)
    ) {
      this.tla_mint_fee = tla_mint_fee;
      this.kap_token_address = kap_token_address;
      this.owner = owner;
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

  @unmanaged
  export class address_object {
    static encode(message: address_object, writer: Writer): void {
      if (message.names_count != 0) {
        writer.uint32(8);
        writer.uint64(message.names_count);
      }
    }

    static decode(reader: Reader, length: i32): address_object {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new address_object();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.names_count = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    names_count: u64;

    constructor(names_count: u64 = 0) {
      this.names_count = names_count;
    }
  }

  export class owner_index_key {
    static encode(message: owner_index_key, writer: Writer): void {
      if (message.owner.length != 0) {
        writer.uint32(10);
        writer.bytes(message.owner);
      }

      if (message.name_hash.length != 0) {
        writer.uint32(18);
        writer.bytes(message.name_hash);
      }
    }

    static decode(reader: Reader, length: i32): owner_index_key {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new owner_index_key();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.owner = reader.bytes();
            break;

          case 2:
            message.name_hash = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    owner: Uint8Array;
    name_hash: Uint8Array;

    constructor(
      owner: Uint8Array = new Uint8Array(0),
      name_hash: Uint8Array = new Uint8Array(0)
    ) {
      this.owner = owner;
      this.name_hash = name_hash;
    }
  }

  export class authorize_mint_args {
    static encode(message: authorize_mint_args, writer: Writer): void {
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

    static decode(reader: Reader, length: i32): authorize_mint_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_mint_args();

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
  export class authorize_mint_res {
    static encode(message: authorize_mint_res, writer: Writer): void {
      if (message.expiration != 0) {
        writer.uint32(8);
        writer.uint64(message.expiration);
      }

      if (message.grace_period_end != 0) {
        writer.uint32(16);
        writer.uint64(message.grace_period_end);
      }
    }

    static decode(reader: Reader, length: i32): authorize_mint_res {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_mint_res();

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

  export class authorize_burn_args {
    static encode(message: authorize_burn_args, writer: Writer): void {
      const unique_name_name = message.name;
      if (unique_name_name !== null) {
        writer.uint32(10);
        writer.fork();
        name_object.encode(unique_name_name, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): authorize_burn_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_burn_args();

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
  export class authorize_burn_res {
    static encode(message: authorize_burn_res, writer: Writer): void {
      if (message.authorized != false) {
        writer.uint32(8);
        writer.bool(message.authorized);
      }
    }

    static decode(reader: Reader, length: i32): authorize_burn_res {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_burn_res();

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

  export class authorize_renewal_args {
    static encode(message: authorize_renewal_args, writer: Writer): void {
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

    static decode(reader: Reader, length: i32): authorize_renewal_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_renewal_args();

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
  export class authorize_renewal_res {
    static encode(message: authorize_renewal_res, writer: Writer): void {
      if (message.expiration != 0) {
        writer.uint32(8);
        writer.uint64(message.expiration);
      }

      if (message.grace_period_end != 0) {
        writer.uint32(16);
        writer.uint64(message.grace_period_end);
      }
    }

    static decode(reader: Reader, length: i32): authorize_renewal_res {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_renewal_res();

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

  export class authorize_reclaim_args {
    static encode(message: authorize_reclaim_args, writer: Writer): void {
      const unique_name_name = message.name;
      if (unique_name_name !== null) {
        writer.uint32(10);
        writer.fork();
        name_object.encode(unique_name_name, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): authorize_reclaim_args {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_reclaim_args();

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
  export class authorize_reclaim_res {
    static encode(message: authorize_reclaim_res, writer: Writer): void {
      if (message.authorized != false) {
        writer.uint32(8);
        writer.bool(message.authorized);
      }
    }

    static decode(reader: Reader, length: i32): authorize_reclaim_res {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new authorize_reclaim_res();

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
}
