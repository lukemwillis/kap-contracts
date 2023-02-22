import { Signer, Provider, Contract } from 'koilib';
import * as path from 'path';
import * as fs from 'fs';
import * as abi from '../contracts/profile/abi/profile-abi.json';
require('dotenv').config();

const CONTRACT_WASM_PATH = '../contracts/profile/build/release/contract.wasm';
const CLI_ABI_PATH = '../contracts/profile/abi/profile.abi';

const { PROFILE_PRIVATE_KEY, RPC_URL } = process.env;

// @ts-ignore koilib_types is needed when using koilib
abi.koilib_types = abi.types;

(async () => {
  // deploy contract
  const provider = new Provider(RPC_URL!);
  const signer = Signer.fromWif(PROFILE_PRIVATE_KEY!);
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

  let res = await contract.deploy({
    abi: fs.readFileSync(path.resolve(__dirname, CLI_ABI_PATH)).toString(),
  });

  await res.transaction?.wait();

  console.log('contract deployed at', contract.getId());
})();