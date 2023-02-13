import { Storage } from '@koinos/sdk-as';
import { koindomain } from '../proto/koindomain';

const PURCHASES_SPACE_ID = 1;

export class Purchases extends Storage.ProtoMap<koindomain.purchase_key, koindomain.purchase_record> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      PURCHASES_SPACE_ID,
      koindomain.purchase_key.decode,
      koindomain.purchase_key.encode,
      koindomain.purchase_record.decode,
      koindomain.purchase_record.encode
    );
  }
}
