import { System, Protobuf, authority } from "@koinos/sdk-as";
import { collections } from "./proto/collections";

export class Collections {
  authorize(args: authority.authorize_arguments): authority.authorize_result {
    // const call = args.call;
    // const type = args.type;

    // YOUR CODE HERE

    const res = new authority.authorize_result();
    res.value = true;

    return res;
  }

  name(args: collections.name_arguments): collections.string_object {
    // YOUR CODE HERE

    const res = new collections.string_object();
    // res.value = ;

    return res;
  }

  symbol(args: collections.symbol_arguments): collections.string_object {
    // YOUR CODE HERE

    const res = new collections.string_object();
    // res.value = ;

    return res;
  }

  uri(args: collections.uri_arguments): collections.string_object {
    // YOUR CODE HERE

    const res = new collections.string_object();
    // res.value = ;

    return res;
  }

  total_supply(
    args: collections.total_supply_arguments
  ): collections.uint64_object {
    // YOUR CODE HERE

    const res = new collections.uint64_object();
    // res.value = ;

    return res;
  }

  royalties(
    args: collections.royalties_arguments
  ): collections.royalties_result {
    // YOUR CODE HERE

    const res = new collections.royalties_result();
    // res.value = ;

    return res;
  }

  set_royalties(
    args: collections.set_royalties_arguments
  ): collections.empty_object {
    // const value = args.value;

    // YOUR CODE HERE

    const res = new collections.empty_object();

    return res;
  }

  owner(args: collections.owner_arguments): collections.bytes_address_object {
    // YOUR CODE HERE

    const res = new collections.bytes_address_object();
    // res.value = ;

    return res;
  }

  transfer_ownership(
    args: collections.transfer_ownership_arguments
  ): collections.empty_object {
    // const owner = args.owner;

    // YOUR CODE HERE

    const res = new collections.empty_object();

    return res;
  }

  balance_of(
    args: collections.balance_of_arguments
  ): collections.uint64_object {
    // const owner = args.owner;

    // YOUR CODE HERE

    const res = new collections.uint64_object();
    // res.value = ;

    return res;
  }

  owner_of(
    args: collections.owner_of_arguments
  ): collections.bytes_address_object {
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new collections.bytes_address_object();
    // res.value = ;

    return res;
  }

  get_approved(
    args: collections.get_approved_arguments
  ): collections.bytes_address_object {
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new collections.bytes_address_object();
    // res.value = ;

    return res;
  }

  is_approved_for_all(
    args: collections.is_approved_for_all_arguments
  ): collections.bool_object {
    // const owner = args.owner;
    // const operator = args.operator;

    // YOUR CODE HERE

    const res = new collections.bool_object();
    // res.value = ;

    return res;
  }

  mint(args: collections.mint_arguments): collections.empty_object {
    // const name = args.name;
    // const duration_increments = args.duration_increments;
    // const owner = args.owner;
    // const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;
    // const data = args.data;

    // YOUR CODE HERE

    const res = new collections.empty_object();

    return res;
  }

  burn(args: collections.burn_arguments): collections.empty_object {
    // const from = args.from;
    // const token_id = args.token_id;
    // const data = args.data;

    // YOUR CODE HERE

    const res = new collections.empty_object();

    return res;
  }

  transfer(args: collections.transfer_arguments): collections.empty_object {
    // const from = args.from;
    // const to = args.to;
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new collections.empty_object();

    return res;
  }

  approve(args: collections.approve_arguments): collections.empty_object {
    // const approver_address = args.approver_address;
    // const to = args.to;
    // const token_id = args.token_id;

    // YOUR CODE HERE

    const res = new collections.empty_object();

    return res;
  }

  set_approval_for_all(
    args: collections.set_approval_for_all_arguments
  ): collections.empty_object {
    // const approver_address = args.approver_address;
    // const operator_address = args.operator_address;
    // const approved = args.approved;

    // YOUR CODE HERE

    const res = new collections.empty_object();

    return res;
  }

  renew(args: collections.renew_arguments): collections.empty_object {
    // const name = args.name;
    // const duration_increments = args.duration_increments;
    // const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;
    // const data = args.data;

    // YOUR CODE HERE

    const res = new collections.empty_object();

    return res;
  }

  get_name(args: collections.get_name_arguments): collections.name_object {
    // const name = args.name;

    // YOUR CODE HERE

    const res = new collections.name_object();
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
    args: collections.get_names_arguments
  ): collections.get_names_result {
    // const owner = args.owner;
    // const name_offset = args.name_offset;
    // const limit = args.limit;
    // const descending = args.descending;

    // YOUR CODE HERE

    const res = new collections.get_names_result();
    // res.names = ;

    return res;
  }

  set_metadata(
    args: collections.set_metadata_arguments
  ): collections.empty_object {
    // const tla_mint_fee = args.tla_mint_fee;
    // const kap_token_address = args.kap_token_address;
    // const owner = args.owner;

    // YOUR CODE HERE

    const res = new collections.empty_object();

    return res;
  }

  get_metadata(
    args: collections.get_metadata_arguments
  ): collections.metadata_object {
    // YOUR CODE HERE

    const res = new collections.metadata_object();
    // res.tla_mint_fee = ;
    // res.kap_token_address = ;
    // res.owner = ;

    return res;
  }
}
