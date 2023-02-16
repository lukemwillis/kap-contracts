import { System, Protobuf, authority } from "@koinos/sdk-as";
import { nameservice } from "./proto/nameservice";

export class Nameservice {
  authorize(args: authority.authorize_arguments): authority.authorize_result {
    // const call = args.call;
    // const type = args.type;

    // YOUR CODE HERE

    const res = new authority.authorize_result();
    res.value = true;

    return res;
  }

  name(args: nameservice.name_arguments): nameservice.string_object {
    // YOUR CODE HERE

    const res = new nameservice.string_object();
    // res.value = ;

    return res;
  }

  symbol(args: nameservice.symbol_arguments): nameservice.string_object {
    // YOUR CODE HERE

    const res = new nameservice.string_object();
    // res.value = ;

    return res;
  }

  uri(args: nameservice.uri_arguments): nameservice.string_object {
    // YOUR CODE HERE

    const res = new nameservice.string_object();
    // res.value = ;

    return res;
  }

  total_supply(
    args: nameservice.total_supply_arguments
  ): nameservice.uint64_object {
    // YOUR CODE HERE

    const res = new nameservice.uint64_object();
    // res.value = ;

    return res;
  }

  royalties(
    args: nameservice.royalties_arguments
  ): nameservice.royalties_result {
    // YOUR CODE HERE

    const res = new nameservice.royalties_result();
    // res.value = ;

    return res;
  }

  set_royalties(
    args: nameservice.set_royalties_arguments
  ): nameservice.empty_object {
    // const value = args.value;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  owner(args: nameservice.owner_arguments): nameservice.bytes_address_object {
    // YOUR CODE HERE

    const res = new nameservice.bytes_address_object();
    // res.value = ;

    return res;
  }

  transfer_ownership(
    args: nameservice.transfer_ownership_arguments
  ): nameservice.empty_object {
    // const owner = args.owner;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  balance_of(
    args: nameservice.balance_of_arguments
  ): nameservice.uint64_object {
    // const owner = args.owner;

    // YOUR CODE HERE

    const res = new nameservice.uint64_object();
    // res.value = ;

    return res;
  }

  owner_of(
    args: nameservice.owner_of_arguments
  ): nameservice.bytes_address_object {
    // const name = args.name;

    // YOUR CODE HERE

    const res = new nameservice.bytes_address_object();
    // res.value = ;

    return res;
  }

  get_approved(
    args: nameservice.get_approved_arguments
  ): nameservice.bytes_address_object {
    // const name = args.name;

    // YOUR CODE HERE

    const res = new nameservice.bytes_address_object();
    // res.value = ;

    return res;
  }

  is_approved_for_all(
    args: nameservice.is_approved_for_all_arguments
  ): nameservice.bool_object {
    // const owner = args.owner;
    // const operator = args.operator;

    // YOUR CODE HERE

    const res = new nameservice.bool_object();
    // res.value = ;

    return res;
  }

  mint(args: nameservice.mint_arguments): nameservice.empty_object {
    // const name = args.name;
    // const duration_increments = args.duration_increments;
    // const owner = args.owner;
    // const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  transfer(args: nameservice.transfer_arguments): nameservice.empty_object {
    // const name = args.name;
    // const from = args.from;
    // const to = args.to;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  approve(args: nameservice.approve_arguments): nameservice.empty_object {
    // const approver_address = args.approver_address;
    // const to = args.to;
    // const name = args.name;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  set_approval_for_all(
    args: nameservice.set_approval_for_all_arguments
  ): nameservice.empty_object {
    // const approver_address = args.approver_address;
    // const operator_address = args.operator_address;
    // const approved = args.approved;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  burn(args: nameservice.burn_arguments): nameservice.empty_object {
    // const name = args.name;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  renew(args: nameservice.renew_arguments): nameservice.empty_object {
    // const name = args.name;
    // const duration_increments = args.duration_increments;
    // const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  get_name(args: nameservice.get_name_arguments): nameservice.name_object {
    // const name = args.name;

    // YOUR CODE HERE

    const res = new nameservice.name_object();
    // res.domain = ;
    // res.name = ;
    // res.owner = ;
    // res.expiration = ;
    // res.grace_period_end = ;
    // res.sub_names_count = ;
    // res.locked_kap_tokens = ;

    return res;
  }

  get_names(
    args: nameservice.get_names_arguments
  ): nameservice.get_names_result {
    // const owner = args.owner;
    // const name_offset = args.name_offset;
    // const limit = args.limit;
    // const descending = args.descending;

    // YOUR CODE HERE

    const res = new nameservice.get_names_result();
    // res.names = ;

    return res;
  }

  set_metadata(
    args: nameservice.set_metadata_arguments
  ): nameservice.empty_object {
    // const tla_mint_fee = args.tla_mint_fee;
    // const kap_token_address = args.kap_token_address;
    // const owner = args.owner;

    // YOUR CODE HERE

    const res = new nameservice.empty_object();

    return res;
  }

  get_metadata(
    args: nameservice.get_metadata_arguments
  ): nameservice.metadata_object {
    // YOUR CODE HERE

    const res = new nameservice.metadata_object();
    // res.tla_mint_fee = ;
    // res.kap_token_address = ;
    // res.owner = ;

    return res;
  }
}
