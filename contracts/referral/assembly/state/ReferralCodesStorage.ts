import { Storage } from '@koinos/sdk-as';
import { referral } from '../proto/referral';
import { REFERRAL_CODES_SPACE_ID } from './spaceIds';

export class ReferralCodesStorage extends Storage.Map<Uint8Array, referral.referral_code> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      REFERRAL_CODES_SPACE_ID,
      referral.referral_code.decode,
      referral.referral_code.encode
    );
  }
}
