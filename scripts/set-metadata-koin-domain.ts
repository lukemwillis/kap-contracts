import { Signer, Provider, Contract } from 'koilib';
import * as abi from '../contracts/koin-domain/abi/koindomain-abi.json';
require('dotenv').config();

const { 
  KOIN_DOMAIN_PRIVATE_KEY, 
  RPC_URL, 
  NAME_SERVICE_ADDRESS,
  USD_ORACLE_ADDRESS
} = process.env;

// @ts-ignore koilib_types is needed when using koilib
abi.koilib_types = abi.types;

(async () => {
  const provider = new Provider(RPC_URL!);
  const signer = Signer.fromWif(KOIN_DOMAIN_PRIVATE_KEY!);
  signer.provider = provider;

  const contract = new Contract({
    id: signer.address,
    // @ts-ignore abi is compatible
    abi,
    provider,
    signer
  });

  const res = await contract.functions.set_metadata({
    nameservice_address: NAME_SERVICE_ADDRESS,
    oracle_address: USD_ORACLE_ADDRESS
  });

  await res.transaction?.wait();

  console.log('Koin Domain metadata set');
})();