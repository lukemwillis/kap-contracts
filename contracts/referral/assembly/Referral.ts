import { System, Protobuf, Arrays, Crypto, authority, error } from "@koinos/sdk-as";
import { referral } from "./proto/referral";
import { ReferralCodesStorage } from "./state/ReferralCodesStorage";

export class Referral {
  contractId: Uint8Array = System.getContractId();
  headBlockTime: u64 = System.getHeadInfo().head_block_time;
  chainId: Uint8Array = System.getChainId();
  referralCodes: ReferralCodesStorage = new ReferralCodesStorage(this.contractId);

  redeem(
    args: referral.redeem_arguments
  ): referral.empty_message {
    const referral_code = args.referral_code;

    // check arguments
    System.require(referral_code != null, 'missing "referral_code" argument', -1);
    System.require(referral_code!.metadata != null, 'missing "referral_code.metadata" argument', -1);
    System.require(referral_code!.metadata!.issuer.length > 0, 'missing "referral_code.metadata.issuer" argument', -1);

    // must be a code for this chain
    System.require(Arrays.equal(this.chainId, referral_code!.metadata!.chain_id), 'invalid "chain_id"', -1);

    // there must be an issuance date
    System.require(referral_code!.metadata!.issuance_date > 0 && referral_code!.metadata!.issuance_date <= this.headBlockTime, 'invalid "issuance_date"', -1);

    // check allowed_redemption_contract if provided
    const caller = System.getCaller().caller;
    if (referral_code!.metadata!.allowed_redemption_contract.length > 0) {
      System.require(Arrays.equal(caller, referral_code!.metadata!.allowed_redemption_contract), 'contract not allowed to redeem this referral code', -1);
    }

    // check allowed_redemption_account if provided
    if (referral_code!.metadata!.allowed_redemption_account.length > 0) {
      System.require(
        Arrays.equal(caller, referral_code!.metadata!.allowed_redemption_account) ||
        System.checkAuthority(authority.authorization_type.contract_call, referral_code!.metadata!.allowed_redemption_account),
        'allowed_redemption_account has not authorized the redemption of this referral code',
        error.error_code.authorization_failure
      );
    }

    // calculate hash 
    const serializedMetadata = Protobuf.encode(referral_code!.metadata, referral.referral_code_metadata.encode);
    const hash = System.hash(Crypto.multicodec.sha2_256, serializedMetadata)!;

    // check if hash has already been redeemed
    System.require(!this.referralCodes.has(hash), 'referral code already redeemed', -1);

    // check signature
    const recoveredPublicKey = System.recoverPublicKey(referral_code!.signature, hash);
    const issuer = Crypto.addressFromPublicKey(recoveredPublicKey!);

    System.require(Arrays.equal(issuer, referral_code!.metadata!.issuer), 'invalid signature', -1);

    // store referral code
    this.referralCodes.put(hash, referral_code!);

    return new referral.empty_message();
  }

  get_referral_code(
    args: referral.get_referral_code_arguments
  ): referral.referral_code {
    const referral_code = args.referral_code;

    const serializedMetadata = Protobuf.encode(referral_code!.metadata, referral.referral_code_metadata.encode);
    const hash = System.hash(Crypto.multicodec.sha2_256, serializedMetadata)!;
    
    const refCode = this.referralCodes.get(hash);
    if (refCode) {
      return refCode;
    }

    return new referral.referral_code();
  }
}
