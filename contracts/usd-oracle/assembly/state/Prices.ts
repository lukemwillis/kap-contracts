import { Storage } from '@koinos/sdk-as';
import { usdoracle } from '../proto/usdoracle';

const PRICES_SPACE_ID = 1;

export class Prices extends Storage.Map<Uint8Array, usdoracle.price_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      PRICES_SPACE_ID,
      usdoracle.price_object.decode,
      usdoracle.price_object.encode,
      () => new usdoracle.price_object()
    );
  }
}
