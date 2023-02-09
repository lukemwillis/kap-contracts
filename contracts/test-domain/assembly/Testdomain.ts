import { Arrays, System, Token } from "@koinos/sdk-as";
import { testdomain } from "./proto/testdomain";

export class Testdomain {
  contractId: Uint8Array = System.getContractId();

  authorize_mint(
    args: testdomain.authorize_mint_arguments
  ): testdomain.authorize_mint_result {
    const name = args.name;
    const domain = args.domain;
    const duration_increments = args.duration_increments;
    const owner = args.owner;
    const payment_from = args.payment_from;
    const payment_token_address = args.payment_token_address;

    // test arguments are properly sent to domain contracts
    System.require(name.length > 0, 'name argument was not provided');
    System.require(domain.length > 0, 'domain argument was not provided');
    System.require(duration_increments > 0, 'duration_increments argument was not provided');
    System.require(owner.length > 0, 'owner argument was not provided');
    System.require(payment_from.length > 0, 'payment_from argument was not provided');
    System.require(payment_token_address.length > 0, 'payment_token_address argument was not provided');

    // test that a domain contract can refuse a name to be minted
    System.require(name != 'banned', 'name "banned" cannot be used');

    // test payments from domain contract
    // require Koin payment for the name kap
    if (name == 'kap') {
      const koinTokenAddr = System.getContractAddress('koin');
      System.require(Arrays.equal(payment_token_address, koinTokenAddr), 'can only pay using Koin');
      
      const koin = new Token(payment_token_address);
      System.require(koin.transfer(payment_from, this.contractId, 1), 'could not process Koin payment');
    }

    // test expiration and grace_period_end are properly sent back to nameservice contract
    const res = new testdomain.authorize_mint_result();
    res.expiration = 1770429035204 * 2 * duration_increments;
    res.grace_period_end = 1770429035204 * 3 * duration_increments;

    // test expiration and grace_period_end are triggering errors when due
    if (name == 'expired') {
      const now = System.getHeadInfo().head_block_time;

      res.expiration = now;
      res.grace_period_end = now + 600000;
    } else if (name == 'expires-now') {
      const now = System.getHeadInfo().head_block_time;

      res.expiration = now;
      res.grace_period_end = now;
    } else if (name == 'grace-period') {
      const now = System.getHeadInfo().head_block_time;

      res.expiration = duration_increments * now;
      res.grace_period_end = duration_increments * now;
    } else if (name == 'never-expires') {
      res.expiration = 0;
    }

    return res;
  }

  authorize_burn(
    args: testdomain.authorize_burn_arguments
  ): testdomain.authorize_burn_result {
    const name = args.name;

    System.require(name != null, 'name argument was not provided');
    
    const res = new testdomain.authorize_burn_result(true);

    // test that a domain contract can refuse a name to be burned
    System.require(name!.name != 'cannot-burn', 'name "cannot-burn" cannot be burned');

    return res;
  }

  authorize_renewal(
    args: testdomain.authorize_renewal_arguments
  ): testdomain.authorize_renewal_result {
    const name = args.name;
    const duration_increments = args.duration_increments;
    const payment_from = args.payment_from;
    const payment_token_address = args.payment_token_address;

    System.require(name != null, 'name argument was not provided');
    System.require(duration_increments > 0, 'duration_increments argument was not provided');
    System.require(payment_from.length > 0, 'payment_from argument was not provided');
    System.require(payment_token_address.length > 0, 'payment_token_address argument was not provided');


    // test that a domain contract can refuse a name to be renewed
    System.require(name!.name != 'cannot-renew', 'name "cannot-renew" cannot be renewed');

    const res = new testdomain.authorize_renewal_result();
    res.expiration = 1770428796867;
    res.grace_period_end = 1770428796869;

    return res;
  }
}
