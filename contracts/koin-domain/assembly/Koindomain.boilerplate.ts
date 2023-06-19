import { System, Protobuf, authority } from "@koinos/sdk-as";
import { koindomain } from "./proto/koindomain";

export class Koindomain {
  authorize(args: authority.authorize_arguments): authority.authorize_result {
    // const call = args.call;
    // const type = args.type;

    // YOUR CODE HERE

    const res = new authority.authorize_result();
    res.value = true;

    return res;
  }

  authorize_mint(
    args: koindomain.authorize_mint_arguments
  ): koindomain.authorize_mint_result {
    // const name = args.name;
    // const domain = args.domain;
    // const duration_increments = args.duration_increments;
    // const owner = args.owner;
    // const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;
    // const data = args.data;

    // YOUR CODE HERE

    const res = new koindomain.authorize_mint_result();
    // res.expiration = ;
    // res.grace_period_end = ;

    return res;
  }

  authorize_burn(
    args: koindomain.authorize_burn_arguments
  ): koindomain.authorize_burn_result {
    // const name = args.name;

    // YOUR CODE HERE

    const res = new koindomain.authorize_burn_result();
    // res.authorized = ;

    return res;
  }

  authorize_renewal(
    args: koindomain.authorize_renewal_arguments
  ): koindomain.authorize_renewal_result {
    // const name = args.name;
    // const duration_increments = args.duration_increments;
    // const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;

    // YOUR CODE HERE

    const res = new koindomain.authorize_renewal_result();
    // res.expiration = ;
    // res.grace_period_end = ;

    return res;
  }

  get_purchases(
    args: koindomain.get_purchases_arguments
  ): koindomain.get_purchases_result {
    // const name = args.name;
    // const timestamp = args.timestamp;
    // const limit = args.limit;
    // const descending = args.descending;

    // YOUR CODE HERE

    const res = new koindomain.get_purchases_result();
    // res.purchases = ;

    return res;
  }

  set_metadata(
    args: koindomain.set_metadata_arguments
  ): koindomain.empty_object {
    // const metadata = args.metadata;

    // YOUR CODE HERE

    const res = new koindomain.empty_object();

    return res;
  }

  get_metadata(
    args: koindomain.get_metadata_arguments
  ): koindomain.metadata_object {
    // YOUR CODE HERE

    const res = new koindomain.metadata_object();
    // res.nameservice_address = ;
    // res.oracle_address = ;
    // res.owner = ;
    // res.press_badge_address = ;
    // res.is_launched = ;
    // res.beneficiary = ;
    // res.referral_contract_address = ;
    // res.referrals_refresh_period = ;
    // res.max_referrals_per_period = ;
    // res.premium_account_referral_discount_percent = ;

    return res;
  }
}
