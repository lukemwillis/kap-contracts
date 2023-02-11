import { System, authority } from "@koinos/sdk-as";
import { usdoracle } from "./proto/usdoracle";
import { Prices } from "./state/Prices";

export class Usdoracle {
  contractId: Uint8Array = System.getContractId();
  prices: Prices = new Prices(this.contractId);


  set_latest_price(
    args: usdoracle.set_latest_price_arguments
  ): usdoracle.empty_object {
    // only this contract can set prices for now
    System.requireAuthority(authority.authorization_type.contract_call, this.contractId);

    const token_address = args.token_address;
    const price = args.price;
    const now = System.getHeadInfo().head_block_time;

    this.prices.put(token_address, new usdoracle.price_object(price, now));

    return new usdoracle.empty_object();
  }

  get_latest_price(
    args: usdoracle.get_latest_price_arguments
  ): usdoracle.price_object {
    const token_address = args.token_address;

    return this.prices.get(token_address)!;
  }
}
