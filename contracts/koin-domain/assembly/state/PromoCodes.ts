import { Storage } from '@koinos/sdk-as';
import { koindomain } from '../proto/koindomain';

const PROMO_CODES_SPACE_ID = 2;

export class PromoCodes extends Storage.Map<Uint8Array, koindomain.empty_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      PROMO_CODES_SPACE_ID,
      koindomain.empty_object.decode,
      koindomain.empty_object.encode
    );
  }
}
