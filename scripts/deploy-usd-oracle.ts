import { Signer, Provider, Contract } from 'koilib';
import * as path from 'path';
import * as fs from 'fs';
import * as abi from '../contracts/usd-oracle/abi/usdoracle-abi.json';
require('dotenv').config();

const CONTRACT_WASM_PATH = './contracts/usd-oracle/build/release/contract.wasm';

const { USD_ORACLE_PRIVATE_KEY, RPC_URL } = process.env;

// @ts-ignore koilib_types is needed when using koilib
abi.koilib_types = abi.types;

(async () => {
  // deploy bridge contract
  const provider = new Provider(RPC_URL!);
  const signer = Signer.fromWif(USD_ORACLE_PRIVATE_KEY!);
  signer.provider = provider;

  const bytecode = fs.readFileSync(path.resolve(__dirname, CONTRACT_WASM_PATH));
  const contract = new Contract({
    id: signer.address,
    // @ts-ignore abi is compatible
    abi,
    provider,
    signer,
    bytecode
  });

  const { transaction } = await contract.deploy();

  await transaction?.wait();

  console.log('contract deployed at', contract.getId());
})();