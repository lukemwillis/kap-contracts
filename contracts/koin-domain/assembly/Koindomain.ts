import {
  System,
  authority,
  Arrays,
  error,
  Protobuf,
  SafeMath,
  Token,
  u128,
  value,
  Crypto,
  StringBytes,
} from "@koinos/sdk-as";
import {
  GET_LATEST_PRICE_ENTRYPOINT,
  BALANCE_OF_ENTRYPOINT,
  GRACE_PERIOD_IN_MS,
  MILLISECONDS_IN_10_YEARS,
  MILLISECONDS_PER_YEAR,
  REDEEM_REFERRAL_CODE_ENTRYPOINT,
  GET_NAME_ENTRYPOINT,
} from "./Constants";
import { koindomain } from "./proto/koindomain";
import { Metadata } from "./state/Metadata";
import { Purchases } from "./state/Purchases";
import { ReferralAllowances } from "./state/ReferralAllowances";

export class Koindomain {
  now: u64 = System.getHeadInfo().head_block_time;
  contractId: Uint8Array = System.getContractId();
  koinAddress: Uint8Array = System.getContractAddress("koin");
  metadata: Metadata = new Metadata(this.contractId);
  purchases: Purchases = new Purchases(this.contractId);
  referralAllowances: ReferralAllowances = new ReferralAllowances(this.contractId);

  private hasNFT(buyer: Uint8Array, nft_address: Uint8Array): bool {
    const args = new koindomain.balance_of_nft_args(buyer);

    const callRes = System.call(
      nft_address,
      BALANCE_OF_ENTRYPOINT,
      Protobuf.encode(args, koindomain.balance_of_nft_args.encode)
    );
    System.require(callRes.code == 0, "failed to retrieve NFT balance");
    const res = Protobuf.decode<koindomain.balance_of_nft_res>(
      callRes.res.object,
      koindomain.balance_of_nft_res.decode
    );

    return res.value > 0;
  }

  private getKAPName(kapName: string, nameservice_address: Uint8Array): koindomain.name_object {
    const args = new koindomain.get_name_args(kapName);

    const callRes = System.call(
      nameservice_address,
      GET_NAME_ENTRYPOINT,
      Protobuf.encode(args, koindomain.get_name_args.encode)
    );

    System.require(callRes.code == 0, "failed to retrieve name");

    const res = Protobuf.decode<koindomain.name_object>(
      callRes.res.object,
      koindomain.name_object.decode
    );

    return res;
  }

  private redeemReferralCode(referral_code: koindomain.referral_code, referralContractAddress: Uint8Array): void {
    const args = new koindomain.redeem_referral_code_args(referral_code);

    const callRes = System.call(
      referralContractAddress,
      REDEEM_REFERRAL_CODE_ENTRYPOINT,
      Protobuf.encode(args, koindomain.redeem_referral_code_args.encode)
    );

    if (callRes.code != 0) {
      System.revert(callRes.res.error ? callRes.res.error!.message : 'could not redeem referral code');
    }
  }

  /**
   * Get the USD price of a token from the oracle contract
   */
  private getLatestUSDPrice(
    tokenAddress: Uint8Array,
    oracle_address: Uint8Array
  ): u64 {
    const args = new koindomain.get_last_usd_price_args(tokenAddress);

    const callRes = System.call(
      oracle_address,
      GET_LATEST_PRICE_ENTRYPOINT,
      Protobuf.encode(args, koindomain.get_last_usd_price_args.encode)
    );
    System.require(callRes.code == 0, "failed to retrieve last USD price");
    const res = Protobuf.decode<koindomain.get_last_usd_price_res>(
      callRes.res.object,
      koindomain.get_last_usd_price_res.decode
    );

    return res.price;
  }

  /**
   * Check that the caller is the Nameservice contract
   */
  private requireNameserviceAuthority(nameserviceAddress: Uint8Array): void {
    const callerData = System.getCaller();

    System.require(
      Arrays.equal(callerData.caller, nameserviceAddress),
      "only nameservice contract can perform this action",
      error.error_code.authorization_failure
    );
  }

  private calculateExpiration(
    durationIncrements: u64,
    existingExpiration: u64 = 0
  ): u64 {
    // durationIncrements is per 1 year increments
    const expirationInMs = SafeMath.mul(
      durationIncrements,
      MILLISECONDS_PER_YEAR
    );

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
    metadata: koindomain.metadata_object,
    applyReferralDiscount: bool = false
  ): u64 {
    const buyerHasPressBadge = this.hasNFT(buyer, metadata.press_badge_address);
    let totalUSDPrice: u64;
    if (buyerHasPressBadge && durationIncrements >= 3) {
      totalUSDPrice = SafeMath.mul(pricePerIncrement, durationIncrements - 1);
    } else {
      totalUSDPrice = SafeMath.mul(pricePerIncrement, durationIncrements);
    }

    // apply referral discount
    if (applyReferralDiscount) {
      const discount = u128
        .from(
          // @ts-ignore can be done in AS
          (u128.fromU64(totalUSDPrice) * u128.from(metadata.premium_account_referral_discount_percent)) /
          // @ts-ignore can be done in AS
          u128.fromU64(100)
        )
        .toU64();
      totalUSDPrice = SafeMath.sub(totalUSDPrice, discount);
    }

    const paymentTokenUSDPrice = this.getLatestUSDPrice(
      this.koinAddress,
      metadata.oracle_address
    );

    // add purchase for $KAP airdrop
    this.purchases.put(
      new koindomain.purchase_key(name, this.now),
      new koindomain.purchase_record(buyer, totalUSDPrice)
    );

    return (
      // multiply the amount of tokens by 10^8 since Koin is 8 decimals
      u128
        .from(
          // @ts-ignore can be done in AS
          (u128.fromU64(totalUSDPrice) * u128.from(1_0000_0000)) /
          // @ts-ignore can be done in AS
          u128.fromU64(paymentTokenUSDPrice)
        )
        .toU64()
    );
  }

  private getPricePerIncrement(nameLength: i32): u64 {
    System.require(nameLength > 0, "name cannot be empty");

    // price is in USD with 8 decimals
    if (nameLength == 1) {
      // $1000
      return 1000_0000_0000;
    } else if (nameLength <= 3) {
      // $500
      return 500_0000_0000;
    } else if (nameLength <= 6) {
      // $100
      return 100_0000_0000;
    } else if (nameLength <= 10) {
      // $10
      return 10_0000_0000;
    } else {
      // FREE
      return 0;
    }
  }

  authorize(args: authority.authorize_arguments): authority.authorize_result {
    const metadata = this.metadata.get()!;

    // if the owner is not this contract id, then check authority of owner
    if (
      metadata.owner.length > 0 &&
      !Arrays.equal(this.contractId, metadata.owner)
    ) {
      return new authority.authorize_result(
        System.checkAuthority(args.type, metadata.owner)
      );
    } else {
      // otherwise check transaction signatures
      const transactionId = System.getTransactionField("id")!.bytes_value;
      const signatures = Protobuf.decode<value.list_type>(
        System.getTransactionField("signatures")!.message_value!.value!,
        value.list_type.decode
      );

      let signature: Uint8Array;
      let recoveredKey: Uint8Array;
      let addr: Uint8Array;

      for (let i = 0; i < signatures.values.length; i++) {
        signature = signatures.values[i].bytes_value;
        recoveredKey = System.recoverPublicKey(signature, transactionId)!;
        addr = Crypto.addressFromPublicKey(recoveredKey);

        if (Arrays.equal(addr, this.contractId)) {
          return new authority.authorize_result(true);
        }
      }
    }

    return new authority.authorize_result(false);
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
    const data = args.data;

    if (!metadata.is_launched) {
      const buyerHasPressBadge = this.hasNFT(
        payment_from,
        metadata.press_badge_address
      );

      if (!buyerHasPressBadge) {
        System.revert("Minting not yet available to the public.");
      }

      const buyerHasKAPName = this.hasNFT(
        payment_from,
        metadata.nameservice_address
      );

      if (buyerHasKAPName) {
        System.revert("Pre-launch name already minted for this address.");
      }
    }

    let isUsingReferralCode = false;
    // if "data" were provided, deserialize into referral code object
    // and process it
    if (data.length > 0) {
      const referral_code = Protobuf.decode<koindomain.referral_code>(data, koindomain.referral_code.decode);
      
      // try to redeem the referral code
      this.redeemReferralCode(referral_code, metadata.referral_contract_address);

      // the metadata.data field of the referral code is used to store the issuer's KAP name
      const issuerKAPNameStr = StringBytes.bytesToString(referral_code.metadata!.data);
      const issuerKAPName = this.getKAPName(issuerKAPNameStr, metadata.nameservice_address);

      System.require(Arrays.equal(issuerKAPName.owner, referral_code.metadata!.issuer), 'referral code issuer is different than the KAP name owner');
      System.require(issuerKAPName.domain == 'koin', 'provided name is not part of the .koin domain');

      const isIssuerPremiumKapName = String.UTF8.byteLength(issuerKAPName.name) <= 10;
      System.require(isIssuerPremiumKapName, 'only premium KAP name holders can issue referral codes');

      let referralAllowance = this.referralAllowances.get(`${issuerKAPName.name}.${issuerKAPName.domain}`);

      // create or refresh the allowance if needed
      if (!referralAllowance || referralAllowance.next_refresh <= this.now) {
        referralAllowance = new koindomain.referral_allowance();
        referralAllowance.max_amount = metadata.max_referrals_per_period;
        referralAllowance.remaining = metadata.max_referrals_per_period;
        referralAllowance.next_refresh = this.now + metadata.referrals_refresh_period;
      }

      System.require(referralAllowance.remaining >= 1, 'the referral code issuer does not have enough referral allowances');

      // update allowance
      referralAllowance.remaining -= 1;
      this.referralAllowances.put(`${issuerKAPName.name}.${issuerKAPName.domain}`, referralAllowance);

      // allow the referral code to be used
      isUsingReferralCode = true;
    }

    const nameLength = String.UTF8.byteLength(name);

    // an account is considered premium if composed of 10 characters or less
    // premium account handling
    if (nameLength <= 10) {
      System.require(
        payment_from.length > 0,
        '"payment_from" argument is missing'
      );

      System.require(
        duration_increments > 0 && duration_increments <= 10,
        "you can only buy a premium account for a period of 1 to 10 years"
      );

      // determine price per increment
      const pricePerIncrement = this.getPricePerIncrement(nameLength);

      // calculate number of tokens to transfer
      const numberOfTokensToTransfer = this.calculateNumberOfTokensToTransfer(
        name,
        pricePerIncrement,
        duration_increments,
        payment_from,
        metadata,
        isUsingReferralCode
      );

      // transfer tokens
      const tokenContract = new Token(this.koinAddress);
      System.require(
        tokenContract.transfer(
          payment_from,
          metadata.beneficiary,
          numberOfTokensToTransfer
        ),
        "could not transfer Koin tokens"
      );

      // calculate expiration
      const expiration = this.calculateExpiration(duration_increments);

      // calculate grace period
      const gracePeriod = this.calculateGracePeriod(expiration);

      return new koindomain.authorize_mint_result(expiration, gracePeriod);
    }
    // non-premium accounts with referral code handling
    else if (isUsingReferralCode) {
      // non-premuim accounts are free forever
      return new koindomain.authorize_mint_result(0, 0);
    }
    // non-premium accounts handling
    else {
      System.revert("free accounts are not available yet");
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
    const metadata = this.metadata.get()!;
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
      "you can only renew a premium account for a period of 1 to 10 years"
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
      metadata
    );

    // transfer tokens
    const tokenContract = new Token(this.koinAddress);
    System.require(
      tokenContract.transfer(
        payment_from,
        metadata.beneficiary,
        numberOfTokensToTransfer
      ),
      "could not transfer Koin tokens"
    );

    // calculate new expiration
    const newExpiration = this.calculateExpiration(
      duration_increments,
      name!.expiration
    );

    System.require(
      newExpiration <= nowPlus10Years,
      "new expiration cannot exceed 10 years"
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

    let startKey = new koindomain.purchase_key(name, timestamp);

    let done = false;
    let purchaseRec: System.ProtoDatabaseObject<koindomain.purchase_record> | null;
    let tmpKey: koindomain.purchase_key;

    do {
      purchaseRec = descending
        ? this.purchases.getPrev(startKey)
        : this.purchases.getNext(startKey);

      if (purchaseRec) {
        tmpKey = Protobuf.decode<koindomain.purchase_key>(
          purchaseRec.key!,
          koindomain.purchase_key.decode
        );

        res.purchases.push(
          new koindomain.purchase_object(
            purchaseRec.value.buyer,
            tmpKey.name,
            purchaseRec.value.usd_amount,
            tmpKey.timestamp
          )
        );

        startKey = tmpKey;
        limit--;
      } else {
        done = true;
      }
    } while (!done && limit > 0);

    return res;
  }

  get_referral_allowance(
    args: koindomain.get_referral_allowance_arguments
  ): koindomain.referral_allowance {
    const name = args.name;

    const metadata = this.metadata.get()!;
    const referralAllowance = this.referralAllowances.get(name);

    if (referralAllowance) {
      if (referralAllowance.next_refresh <= this.now) {
        referralAllowance.max_amount = metadata.max_referrals_per_period;
        referralAllowance.remaining = metadata.max_referrals_per_period;
        referralAllowance.next_refresh = this.now + metadata.referrals_refresh_period;
      }

      return referralAllowance;
    }

    return new koindomain.referral_allowance();
  }

  set_metadata(
    args: koindomain.set_metadata_arguments
  ): koindomain.empty_object {
    // only this contract can set the metadata for now
    System.requireAuthority(
      authority.authorization_type.contract_call,
      this.contractId
    );

    const metadata = args.metadata;

    this.metadata.put(metadata!);

    return new koindomain.empty_object();
  }

  get_metadata(
    args: koindomain.get_metadata_arguments
  ): koindomain.metadata_object {
    return this.metadata.get()!;
  }
}
