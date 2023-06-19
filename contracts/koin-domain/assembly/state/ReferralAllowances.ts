import { Storage } from '@koinos/sdk-as';
import { koindomain } from '../proto/koindomain';

const REFERRAL_ALLOWANCES_SPACE_ID = 2;

export class ReferralAllowances extends Storage.Map<string, koindomain.referral_allowance> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      REFERRAL_ALLOWANCES_SPACE_ID,
      koindomain.referral_allowance.decode,
      koindomain.referral_allowance.encode
    );
  }
}
