import { System, authority, Arrays, error, Protobuf, SafeMath, Token, u128 } from "@koinos/sdk-as";
import { GET_LATEST_PRICE_ENTRYPOINT, GRACE_PERIOD_IN_MS, MILLISECONDS_IN_10_YEARS, MILLISECONDS_PER_DAY, MILLISECONDS_PER_YEAR } from "./Constants";
import { koindomain } from "./proto/koindomain";
import { Metadata } from "./state/Metadata";
import { Purchases } from "./state/Purchases";

export class Koindomain {
  now: u64 = System.getHeadInfo().head_block_time;
  contractId: Uint8Array = System.getContractId();
  koinAddress: Uint8Array = System.getContractAddress('koin');
  metadata: Metadata = new Metadata(this.contractId);
  purchases: Purchases = new Purchases(this.contractId);

  /**
    * Get the USD price of a token from the oracle contract
    */
  private getLatestUSDPrice(tokenAddress: Uint8Array, oracle_address: Uint8Array): u64 {
    const args = new koindomain.get_last_usd_price_args(tokenAddress);

    const callRes = System.call(oracle_address, GET_LATEST_PRICE_ENTRYPOINT, Protobuf.encode(args, koindomain.get_last_usd_price_args.encode));
    System.require(callRes.code == 0, "failed to retrieve last USD price");
    const res = Protobuf.decode<koindomain.get_last_usd_price_res>(callRes.res.object, koindomain.get_last_usd_price_res.decode);

    return res.price;
  }

  /**
    * Check that the caller is the Nameservice contract
    */
  private requireNameserviceAuthority(nameserviceAddress: Uint8Array): void {
    const callerData = System.getCaller();

    System.require(
      Arrays.equal(callerData.caller, nameserviceAddress),
      'only nameservice contract can perform this action',
      error.error_code.authorization_failure
    );
  }

  private calculateExpiration(durationIncrements: u64, existingExpiration: u64 = 0): u64 {
    // durationIncrements is per 1 year increments
    const expirationInMs = SafeMath.mul(durationIncrements, MILLISECONDS_PER_YEAR);

    if (existingExpiration > 0) {
      return SafeMath.add(existingExpiration, expirationInMs);
    }

    return SafeMath.add(this.now, expirationInMs);
  }

  private calculateGracePeriod(expiration: u64): u64 {
    return SafeMath.add(expiration, GRACE_PERIOD_IN_MS);
  }

  private calculateNumberOfTokensToTransfer(
    name: string,
    pricePerIncrement: u64,
    durationIncrements: u64,
    buyer: Uint8Array,
    oracleAddress: Uint8Array
  ): u64 {
    const totalUSDPrice = SafeMath.mul(pricePerIncrement, durationIncrements);
    const paymentTokenUSDPrice = this.getLatestUSDPrice(this.koinAddress, oracleAddress);

    // add purchase for $KAP airdrop
    this.purchases.put(
      new koindomain.purchase_key(name, this.now),
      new koindomain.purchase_record(buyer, totalUSDPrice)
    );

    return (
      // multiply the amount of tokens by 10^8 since Koin is 8 decimals
      //@ts-ignore can be done in AS
      u128.from(u128.fromU64(totalUSDPrice) * u128.from(1_0000_0000) / u128.fromU64(paymentTokenUSDPrice)).toU64()
    );
  }

  private getPricePerIncrement(nameLength: i32): u64 {
    let pricePerIncrement: u64 = 0;

    // price is in USD with 8 decimals
    if (nameLength == 1) {
      // $1000
      pricePerIncrement = 1000_0000_0000;
    } else if (nameLength >= 2 && nameLength <= 3) {
      // $500
      pricePerIncrement = 500_0000_0000;
    } else if (nameLength >= 4 && nameLength <= 6) {
      // $100
      pricePerIncrement = 100_0000_0000;
    } else {
      // $10
      pricePerIncrement = 10_0000_0000;
    }

    return pricePerIncrement;
  }

  authorize_mint(
    args: koindomain.authorize_mint_arguments
  ): koindomain.authorize_mint_result {
    const metadata = this.metadata.get()!;

    this.requireNameserviceAuthority(metadata.nameservice_address);

    const name = args.name;
    // const domain = args.domain;
    const duration_increments = args.duration_increments;
    // const owner = args.owner;
    const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;

    const nameLength = name.length;

    // an account is considered premium if composed of 10 characters or less
    // premium account handling 
    if (nameLength <= 10) {
      System.require(
        payment_from.length > 0,
        '"payment_from" argument is missing'
      );

      System.require(
        duration_increments > 0 && duration_increments <= 10,
        'you can only buy a premium account for a period of 1 to 10 years'
      );

      // determine price per increment
      const pricePerIncrement = this.getPricePerIncrement(nameLength);

      // calculate number of tokens to transfer
      const numberOfTokensToTransfer = this.calculateNumberOfTokensToTransfer(
        name,
        pricePerIncrement,
        duration_increments,
        payment_from,
        metadata.oracle_address
      );

      // transfer tokens
      const tokenContract = new Token(this.koinAddress);
      System.require(tokenContract.transfer(payment_from, this.contractId, numberOfTokensToTransfer), 'could not transfer Koin tokens');

      // calculate expiration
      const expiration = this.calculateExpiration(duration_increments);

      // calculate grace period
      const gracePeriod = this.calculateGracePeriod(expiration);

      return new koindomain.authorize_mint_result(expiration, gracePeriod);
    }
    // non-premium accounts handling
    else {
      System.revert('free accounts are not available yet');
      // non-premuim accounts are free forever
      return new koindomain.authorize_mint_result(0, 0);
    }
  }

  authorize_burn(
    args: koindomain.authorize_burn_arguments
  ): koindomain.authorize_burn_result {

    // no restrictions on name burn
    return new koindomain.authorize_burn_result(true);
  }

  authorize_renewal(
    args: koindomain.authorize_renewal_arguments
  ): koindomain.authorize_renewal_result {
    const metadata = this.metadata.get()!
    this.requireNameserviceAuthority(metadata.nameservice_address);

    const name = args.name;
    const duration_increments = args.duration_increments;
    const payment_from = args.payment_from;
    // const payment_token_address = args.payment_token_address;

    System.require(
      payment_from.length > 0,
      '"payment_from" argument is missing'
    );

    System.require(
      duration_increments > 0 && duration_increments <= 10,
      'you can only renew a premium account for a period of 1 to 10 years'
    );

    const nowPlus10Years = SafeMath.add(this.now, MILLISECONDS_IN_10_YEARS);

    // determine price per increment
    const pricePerIncrement = this.getPricePerIncrement(name!.name.length);

    // calculate number of tokens to transfer
    const numberOfTokensToTransfer = this.calculateNumberOfTokensToTransfer(
      name!.name,
      pricePerIncrement,
      duration_increments,
      payment_from,
      metadata.oracle_address
    );

    // transfer tokens
    const tokenContract = new Token(this.koinAddress);
    System.require(tokenContract.transfer(payment_from, this.contractId, numberOfTokensToTransfer), 'could not transfer Koin tokens');

    // calculate new expiration
    const newExpiration = this.calculateExpiration(duration_increments, name!.expiration);

    System.require(
      newExpiration <= nowPlus10Years,
      'new expiration cannot exceed 10 years'
    );

    // calculate grace period
    const gracePeriod = this.calculateGracePeriod(newExpiration);

    return new koindomain.authorize_renewal_result(newExpiration, gracePeriod);
  }

  get_purchases(
    args: koindomain.get_purchases_arguments
  ): koindomain.get_purchases_result {
    const name = args.name;
    const timestamp = args.timestamp;
    const descending = args.descending;
    let limit = args.limit || 10;

    const res = new koindomain.get_purchases_result();

    let startKey = new koindomain.purchase_key(
      name,
      timestamp
    );

    let done = false;
    let purchaseRec: System.ProtoDatabaseObject<koindomain.purchase_record> | null;
    let tmpKey: koindomain.purchase_key;

    do {
      purchaseRec = descending ? this.purchases.getPrev(startKey) : this.purchases.getNext(startKey);

      if (purchaseRec) {
        tmpKey = Protobuf.decode<koindomain.purchase_key>(purchaseRec.key!, koindomain.purchase_key.decode);

        res.purchases.push(new koindomain.purchase_object(
          purchaseRec.value.buyer,
          tmpKey.name,
          purchaseRec.value.usd_amount,
          tmpKey.timestamp
        ));

        startKey = tmpKey;
        limit--;
      } else {
        done = true;
      }

    } while (!done && limit > 0);

    return res;
  }

  set_metadata(
    args: koindomain.set_metadata_arguments
  ): koindomain.empty_object {
    // only this contract can set the metadata for now
    System.requireAuthority(authority.authorization_type.contract_call, this.contractId);

    const nameservice_address = args.nameservice_address;
    const oracle_address = args.oracle_address;

    this.metadata.put(new koindomain.metadata_object(
      nameservice_address,
      oracle_address
    ));

    return new koindomain.empty_object();
  }

  get_metadata(
    args: koindomain.get_metadata_arguments
  ): koindomain.metadata_object {

    return this.metadata.get()!;
  }
}
