/* eslint-disable @typescript-eslint/ban-ts-comment */
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
  await localKoinos.startBlockProduction();

  await localKoinos.deployKoinContract();
  await localKoinos.mintKoinDefaultAccounts();
  await localKoinos.deployNameServiceContract();
  await localKoinos.setNameServiceRecord('koin', koin.address);
});

afterAll(async () => {
  // stop local-koinos node
  await localKoinos.stopNode();
});

describe('mint', () => {
  it('should mint a .koin name', async () => {
    // deploy koin domain 
    // @ts-ignore abi is compatible
    koinDomainContract = await localKoinos.deployContract(koinDomainAcct.wif, './build/debug/contract.wasm', koindomainAbi);

    // deploy nameservice  
    // @ts-ignore abi is compatible
    nameserviceContract = await localKoinos.deployContract(nameserviceAcct.wif, '../name-service/build/debug/contract.wasm', nameserviceAbi);

    // deploy usd oracle
    // @ts-ignore abi is compatible
    usdOracleContract = await localKoinos.deployContract(usdOracleAcct.wif, '../usd-oracle/build/debug/contract.wasm', usdOracleAbi);

    // set koin domain contract metadata
    let res = await koinDomainContract.functions.set_metadata({
      nameservice_address: nameserviceAcct.address,
      oracle_address: usdOracleAcct.address
    });

    await res.transaction?.wait();

    res = await koinDomainContract.functions.get_metadata({});

    expect(res?.result?.nameservice_address).toEqual(nameserviceAcct.address);
    expect(res?.result?.oracle_address).toEqual(usdOracleAcct.address);

    // mint the koin name to koin domain account
    res = await nameserviceContract.functions.mint({
      name: 'koin',
      owner: koinDomainAcct.address
    });

    await res.transaction?.wait();

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

    await res.transaction?.wait();

    res = await usdOracleContract.functions.get_latest_price({
      token_address: koin.address,
    });

    expect(res?.result?.price).toEqual('100000000');

    // buy a 10 char name for 1 year (should cost $10x1=$10 => 10 Koin)
    let user1Bal = await localKoinos.koin.balanceOf(user1.address);
    expect(user1Bal).toEqual('5000000000000');

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

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '1234567891.koin'
    });

    expect(res?.result?.domain).toEqual('koin');
    expect(res?.result?.name).toEqual('1234567891');
    expect(res?.result?.owner).toEqual(user1.address);

    user1Bal = await localKoinos.koin.balanceOf(user1.address);
    expect(user1Bal).toEqual('4999000000000');

    let koinDomainBal = await localKoinos.koin.balanceOf(koinDomainAcct.address);
    expect(koinDomainBal).toEqual('5001000000000');

    res = await koinDomainContract.functions.get_purchases({});

    expect(res.result).toEqual({
      purchases: expect.arrayContaining([
        expect.objectContaining({
          buyer: user1.address,
          name: '1234567891',
          usd_amount: '1000000000',
        })
      ])
    })

    // buy a 5 char name for 2 years (should cost $100x2=$200 => 200 Koin)
    res = await nameserviceContract.functions.mint({
      name: '12345.koin',
      owner: user2.address,
      duration_increments: 2, // 2 years
      payment_from: user2.address,
    }, {
      beforeSend: async (tx) => {
        await user2.signer.signTransaction(tx)
      }
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '12345.koin'
    });

    expect(res?.result?.domain).toEqual('koin');
    expect(res?.result?.name).toEqual('12345');
    expect(res?.result?.owner).toEqual(user2.address);

    let user2Bal = await localKoinos.koin.balanceOf(user2.address);
    expect(user2Bal).toEqual('4980000000000');

    koinDomainBal = await localKoinos.koin.balanceOf(koinDomainAcct.address);
    expect(koinDomainBal).toEqual('5021000000000');

    res = await koinDomainContract.functions.get_purchases({});

    expect(res.result).toEqual({
      purchases: expect.arrayContaining([
        expect.objectContaining({
          buyer: user1.address,
          name: '1234567891',
          usd_amount: '1000000000',
        }),
        expect.objectContaining({
          buyer: user2.address,
          name: '12345',
          usd_amount: '20000000000',
        })
      ])
    })

    // buy a 2 char name for 3 years (should cost $500x3=$1500 => 1500 Koin)
    res = await nameserviceContract.functions.mint({
      name: '12.koin',
      owner: user3.address,
      duration_increments: 3, // 2 years
      payment_from: user3.address,
    }, {
      beforeSend: async (tx) => {
        await user3.signer.signTransaction(tx)
      }
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '12.koin'
    });

    expect(res?.result?.domain).toEqual('koin');
    expect(res?.result?.name).toEqual('12');
    expect(res?.result?.owner).toEqual(user3.address);

    let user3Bal = await localKoinos.koin.balanceOf(user3.address);
    expect(user3Bal).toEqual('4850000000000');

    koinDomainBal = await localKoinos.koin.balanceOf(koinDomainAcct.address);
    expect(koinDomainBal).toEqual('5171000000000');

    res = await koinDomainContract.functions.get_purchases({});

    expect(res.result).toEqual({
      purchases: expect.arrayContaining([
        expect.objectContaining({
          buyer: user1.address,
          name: '1234567891',
          usd_amount: '1000000000',
        }),
        expect.objectContaining({
          buyer: user2.address,
          name: '12345',
          usd_amount: '20000000000',
        }),
        expect.objectContaining({
          buyer: user3.address,
          name: '12',
          usd_amount: '150000000000',
        })
      ])
    })

    // buy a 1 char name for 10 years (should cost $1000x10=$10000 => 1000 Koin)
    res = await nameserviceContract.functions.mint({
      name: '1.koin',
      owner: user4.address,
      duration_increments: 10, // 2 years
      payment_from: user4.address,
    }, {
      beforeSend: async (tx) => {
        await user4.signer.signTransaction(tx)
      }
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '1.koin'
    });

    expect(res?.result?.domain).toEqual('koin');
    expect(res?.result?.name).toEqual('1');
    expect(res?.result?.owner).toEqual(user4.address);

    let user4Bal = await localKoinos.koin.balanceOf(user4.address);
    expect(user4Bal).toEqual('4000000000000');

    koinDomainBal = await localKoinos.koin.balanceOf(koinDomainAcct.address);
    expect(koinDomainBal).toEqual('6171000000000');

    res = await koinDomainContract.functions.get_purchases({});

    expect(res.result).toEqual({
      purchases: expect.arrayContaining([
        expect.objectContaining({
          buyer: user1.address,
          name: '1234567891',
          usd_amount: '1000000000',
        }),
        expect.objectContaining({
          buyer: user2.address,
          name: '12345',
          usd_amount: '20000000000',
        }),
        expect.objectContaining({
          buyer: user3.address,
          name: '12',
          usd_amount: '150000000000',
        }),
        expect.objectContaining({
          buyer: user4.address,
          name: '1',
          usd_amount: '1000000000000',
        })
      ])
    })

    // set the koin price in oracle to $1000
    res = await usdOracleContract.functions.set_latest_price({
      token_address: koin.address,
      price: '100000000000' // $1000
    });

    await res.transaction?.wait();

    // buy a 10 char name for 1 year (should cost $10x1=$10 => 10 Koin)
    res = await nameserviceContract.functions.mint({
      name: '1234567892.koin',
      owner: user1.address,
      duration_increments: 1, // 1 year
      payment_from: user1.address,
    }, {
      beforeSend: async (tx) => {
        await user1.signer.signTransaction(tx)
      }
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '1234567892.koin'
    });

    expect(res?.result?.domain).toEqual('koin');
    expect(res?.result?.name).toEqual('1234567892');
    expect(res?.result?.owner).toEqual(user1.address);

    user1Bal = await localKoinos.koin.balanceOf(user1.address);
    expect(user1Bal).toEqual('4998999000000');

    koinDomainBal = await localKoinos.koin.balanceOf(koinDomainAcct.address);
    expect(koinDomainBal).toEqual('6171001000000');

    res = await koinDomainContract.functions.get_purchases({});

    expect(res.result).toEqual({
      purchases: expect.arrayContaining([
        expect.objectContaining({
          buyer: user1.address,
          name: '1234567891',
          usd_amount: '1000000000',
        }),
        expect.objectContaining({
          buyer: user2.address,
          name: '12345',
          usd_amount: '20000000000',
        }),
        expect.objectContaining({
          buyer: user3.address,
          name: '12',
          usd_amount: '150000000000',
        }),
        expect.objectContaining({
          buyer: user4.address,
          name: '1',
          usd_amount: '1000000000000',
        }),
        expect.objectContaining({
          buyer: user1.address,
          name: '1234567892',
          usd_amount: '1000000000',
        }),
      ])
    })
  });
});
