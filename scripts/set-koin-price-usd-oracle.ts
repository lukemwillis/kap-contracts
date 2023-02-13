import { Signer, Provider, Contract } from 'koilib';
import * as abi from '../contracts/usd-oracle/abi/usdoracle-abi.json';
require('dotenv').config();

const { USD_ORACLE_PRIVATE_KEY, RPC_URL, KOIN_TOKEN_ADDRESS, KOIN_USD_PRICE } = process.env;

// @ts-ignore koilib_types is needed when using koilib
abi.koilib_types = abi.types;

(async () => {
  const provider = new Provider(RPC_URL!);
  const signer = Signer.fromWif(USD_ORACLE_PRIVATE_KEY!);
  signer.provider = provider;

  const contract = new Contract({
    id: signer.address,
    // @ts-ignore abi is compatible
    abi,
    provider,
    signer
  });

  // set Koin price to $0.5
  const res = await contract.functions.set_latest_price({
    token_address: KOIN_TOKEN_ADDRESS,
    price: KOIN_USD_PRICE // 8 decimals
  });

  await res.transaction?.wait();

  console.log('Koin price set to', KOIN_USD_PRICE);
})();