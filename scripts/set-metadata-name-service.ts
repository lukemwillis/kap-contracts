import { Signer, Provider, Contract } from 'koilib';
import * as abi from '../contracts/name-service/abi/nameservice-abi.json';
require('dotenv').config();

const { 
  NAME_SERVICE_PRIVATE_KEY, 
  RPC_URL, 
  KAP_TOKEN_ADDRESS,
  TLA_MINT_FEE
} = process.env;

// @ts-ignore koilib_types is needed when using koilib
abi.koilib_types = abi.types;

(async () => {
  const provider = new Provider(RPC_URL!);
  const signer = Signer.fromWif(NAME_SERVICE_PRIVATE_KEY!);
  signer.provider = provider;

  const contract = new Contract({
    id: signer.address,
    // @ts-ignore abi is compatible
    abi,
    provider,
    signer
  });

  const res = await contract.functions.set_metadata({
    tla_mint_fee: TLA_MINT_FEE,
    kap_token_address: KAP_TOKEN_ADDRESS
  });

  await res.transaction?.wait();

  console.log('Name Service metadata set');
})();