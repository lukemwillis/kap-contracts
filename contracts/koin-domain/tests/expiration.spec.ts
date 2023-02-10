/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from 'fs';
import { Contract, LocalKoinos, Token } from '@roamin/local-koinos';

// ABIs
import * as koindomainAbi from '../abi/koindomain-abi.json';
import * as nameserviceAbi from '../../name-service/abi/nameservice-abi.json';
import * as usdOracleAbi from '../../usd-oracle/abi/usdoracle-abi.json';

// @ts-ignore koilib_types is needed when using koilib
koindomainAbi.koilib_types = koindomainAbi.types;
// @ts-ignore koilib_types is needed when using koilib
nameserviceAbi.koilib_types = nameserviceAbi.types;
// @ts-ignore koilib_types is needed when using koilib
usdOracleAbi.koilib_types = usdOracleAbi.types;

jest.setTimeout(600000);

let localKoinos = new LocalKoinos();

if (process.env.ENV === 'LOCAL') {
  localKoinos = new LocalKoinos({
    rpc: 'http://host.docker.internal:8080',
    amqp: 'amqp://host.docker.internal:5672'
  });
}

const [
  genesis,
  koin,
  nameserviceAcct,
  koinDomainAcct,
  usdOracleAcct,
  user1,
  user2,
  user3,
  user4
] = localKoinos.getAccounts();

let koinDomainContract: Contract;
let nameserviceContract: Contract;
let usdOracleContract: Contract;

beforeAll(async () => {
  // start local-koinos node
  await localKoinos.startNode();

  await localKoinos.deployKoinContract({ mode: 'manual' });
  await localKoinos.mintKoinDefaultAccounts({ mode: 'manual' });
  await localKoinos.deployNameServiceContract({ mode: 'manual' });
  await localKoinos.setNameServiceRecord('koin', koin.address, { mode: 'manual' });
});

afterAll(async () => {
  // stop local-koinos node
  await localKoinos.stopNode();
});

const MILLISECONDS_PER_DAY = 86_400_000;
const MILLISECONDS_PER_YEAR = MILLISECONDS_PER_DAY * 365;
function addYears(date: Date, nbYears: number) {
  const dateCopy = new Date(date.getTime() + (nbYears * MILLISECONDS_PER_YEAR));

  return dateCopy;
}

function addDays(date: Date, nbDays: number) {
  const dateCopy = new Date(date.getTime() + (nbDays * MILLISECONDS_PER_DAY));

  return dateCopy;
}

describe('mint', () => {
  it('should set the correct expiration and grace period', async () => {
    // deploy koin domain 
    // @ts-ignore abi is compatible
    koinDomainContract = await localKoinos.deployContract(koinDomainAcct.wif, './build/debug/contract.wasm', koindomainAbi, { mode: 'manual' });

    // deploy nameservice  
    // @ts-ignore abi is compatible
    nameserviceContract = await localKoinos.deployContract(nameserviceAcct.wif, '../name-service/build/debug/contract.wasm', nameserviceAbi, { mode: 'manual' });

    // deploy usd oracle
    // @ts-ignore abi is compatible
    usdOracleContract = await localKoinos.deployContract(usdOracleAcct.wif, '../usd-oracle/build/debug/contract.wasm', usdOracleAbi, { mode: 'manual' });

    // set koin domain contract metadata
    let res = await koinDomainContract.functions.set_metadata({
      nameservice_address: nameserviceAcct.address,
      oracle_address: usdOracleAcct.address
    });

    await localKoinos.produceBlock();

    res = await koinDomainContract.functions.get_metadata({});

    expect(res?.result?.nameservice_address).toEqual(nameserviceAcct.address);
    expect(res?.result?.oracle_address).toEqual(usdOracleAcct.address);

    // mint the koin name to koin domain account
    res = await nameserviceContract.functions.mint({
      name: 'koin',
      owner: koinDomainAcct.address
    });

    await localKoinos.produceBlock();

    res = await nameserviceContract.functions.get_name({
      name: 'koin',
    });

    expect(res?.result?.domain).toEqual(undefined);
    expect(res.result).toStrictEqual({
      name: 'koin',
      owner: koinDomainAcct.address,
      expiration: '0',
      grace_period_end: '0',
      sub_names_count: '0',
      locked_kap_tokens: '0'
    });

    // set the koin price in oracle to $1
    res = await usdOracleContract.functions.set_latest_price({
      token_address: koin.address,
      price: '100000000' // $1
    });

    await localKoinos.produceBlock();

    // when minting
    res = await nameserviceContract.functions.mint({
      name: '1234567891.koin',
      owner: user1.address,
      duration_increments: 1, // 1 year
      payment_from: user1.address,
    }, {
      beforeSend: async (tx) => {
        await user1.signer.signTransaction(tx)
      }
    });

    let now = new Date()
    let nowMs = now.getTime()

    await localKoinos.produceBlock({
      blockHeader: {
        timestamp: nowMs.toString()
      }
    });

    res = await nameserviceContract.functions.get_name({
      name: '1234567891.koin'
    });

    // expiration is 1 year from now
    let expiration = addYears(now, 1)
    // grace period is expiration + 60 days
    let gracePeriod = addDays(expiration, 60).getTime()

    expect(res?.result?.domain).toEqual('koin');
    expect(res?.result?.name).toEqual('1234567891');
    expect(res?.result?.owner).toEqual(user1.address);
    expect(res?.result?.expiration).toEqual(expiration.getTime().toString());
    expect(res?.result?.grace_period_end).toEqual(gracePeriod.toString());

    // when renewing
    res = await nameserviceContract.functions.renew({
      name: '1234567891.koin',
      duration_increments: 1, // 1 year
      payment_from: user1.address,
    }, {
      beforeSend: async (tx) => {
        await user1.signer.signTransaction(tx)
      }
    });

    await localKoinos.produceBlock();

    res = await nameserviceContract.functions.get_name({
      name: '1234567891.koin'
    });

    // expiration is old expiration + 1 year
    expiration = addYears(expiration, 1)
    // grace period is new expiration + 60 days
    gracePeriod = addDays(expiration, 60).getTime()

    expect(res?.result?.domain).toEqual('koin');
    expect(res?.result?.name).toEqual('1234567891');
    expect(res?.result?.owner).toEqual(user1.address);
    expect(res?.result?.expiration).toEqual(expiration.getTime().toString());
    expect(res?.result?.grace_period_end).toEqual(gracePeriod.toString());
  });
});
