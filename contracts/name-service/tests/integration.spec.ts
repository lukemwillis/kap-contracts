/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Contract, LocalKoinos, Token } from '@roamin/local-koinos';

import * as abi from '../abi/nameservice-abi.json';

// @ts-ignore koilib_types is needed when using koilib
abi.koilib_types = abi.types;

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
  doedotkoinDomainAcct,
  kapAcct,
  dummyToken,
  user1,
  user2,
  user3,
  user4,
] = localKoinos.getAccounts();

let nameserviceContract: Contract;
let kapContract: Token;

const durationIncrements = 3;

beforeAll(async () => {
  // start local-koinos node
  await localKoinos.startNode();

  await localKoinos.deployKoinContract({ mode: 'manual' });
  await localKoinos.mintKoinDefaultAccounts({ mode: 'manual' });
  await localKoinos.deployNameServiceContract({ mode: 'manual' });
  await localKoinos.setNameServiceRecord('koin', koin.address, { mode: 'manual' });

  // deploy nameservice 
  // @ts-ignore abi is compatible
  nameserviceContract = await localKoinos.deployContract(nameserviceAcct.wif, './build/debug/contract.wasm', abi, { mode: 'manual' });

  // deploy koindomain  
  // @ts-ignore abi is compatible
  await localKoinos.deployContract(koinDomainAcct.wif, '../test-domain/build/debug/contract.wasm', abi, { mode: 'manual' });

  // deploy doe.koin  
  // @ts-ignore abi is compatible
  await localKoinos.deployContract(doedotkoinDomainAcct.wif, '../test-domain/build/debug/contract.wasm', abi, { mode: 'manual' });

  await localKoinos.startBlockProduction();
});

afterAll(async () => {
  // stop local-koinos node
  await localKoinos.stopNode();
});

describe('mint', () => {
  it('should mint TLAs, names and sub names', async () => {
    // ASCII characters
    let res = await nameserviceContract.functions.mint({
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

    res = await nameserviceContract.functions.mint({
      name: 'doe.koin',
      duration_increments: durationIncrements,
      owner: doedotkoinDomainAcct.address,
      payment_from: doedotkoinDomainAcct.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'doe.koin',
    });

    expect(res.result).toStrictEqual({
      domain: 'koin',
      name: 'doe',
      owner: doedotkoinDomainAcct.address,
      expiration: `${durationIncrements * 1770429035204 * 2}`,
      grace_period_end: `${durationIncrements * 1770429035204 * 3}`,
      sub_names_count: '0',
      locked_kap_tokens: '0'
    });

    // check sub_names_count incremented on koin domain
    res = await nameserviceContract.functions.get_name({
      name: 'koin',
    });

    expect(res?.result?.sub_names_count).toEqual('1');

    res = await nameserviceContract.functions.mint({
      name: 'john.doe.koin',
      duration_increments: 3,
      owner: user1.address,
      payment_from: user1.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'john.doe.koin',
    });

    expect(res.result).toStrictEqual({
      domain: 'doe.koin',
      name: 'john',
      owner: user1.address,
      expiration: `${durationIncrements * 1770429035204 * 2}`,
      grace_period_end: `${durationIncrements * 1770429035204 * 3}`,
      sub_names_count: '0',
      locked_kap_tokens: '0'
    });

    // emojis
    res = await nameserviceContract.functions.mint({
      name: '💎',
      owner: koinDomainAcct.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '💎',
    });

    expect(res?.result?.domain).toEqual(undefined);
    expect(res.result).toStrictEqual({
      name: '💎',
      owner: koinDomainAcct.address,
      expiration: '0',
      grace_period_end: '0',
      sub_names_count: '0',
      locked_kap_tokens: '0'
    });

    res = await nameserviceContract.functions.mint({
      name: '🔥.💎',
      duration_increments: 3,
      owner: doedotkoinDomainAcct.address,
      payment_from: doedotkoinDomainAcct.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '🔥.💎',
    });

    expect(res.result).toStrictEqual({
      domain: '💎',
      name: '🔥',
      owner: doedotkoinDomainAcct.address,
      expiration: `${durationIncrements * 1770429035204 * 2}`,
      grace_period_end: `${durationIncrements * 1770429035204 * 3}`,
      sub_names_count: '0',
      locked_kap_tokens: '0'
    });

    res = await nameserviceContract.functions.mint({
      name: '❤️.🔥.💎',
      duration_increments: 3,
      owner: user1.address,
      payment_from: user1.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '❤️.🔥.💎',
    });

    expect(res.result).toStrictEqual({
      domain: '🔥.💎',
      name: '❤️',
      owner: user1.address,
      expiration: `${durationIncrements * 1770429035204 * 2}`,
      grace_period_end: `${durationIncrements * 1770429035204 * 3}`,
      sub_names_count: '0',
      locked_kap_tokens: '0'
    });

    // Chinese characters
    res = await nameserviceContract.functions.mint({
      name: '钻石',
      owner: koinDomainAcct.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '钻石',
    });

    expect(res?.result?.domain).toEqual(undefined);
    expect(res.result).toStrictEqual({
      name: '钻石',
      owner: koinDomainAcct.address,
      expiration: '0',
      grace_period_end: '0',
      sub_names_count: '0',
      locked_kap_tokens: '0'
    });

    res = await nameserviceContract.functions.mint({
      name: '火.钻石',
      duration_increments: 3,
      owner: doedotkoinDomainAcct.address,
      payment_from: doedotkoinDomainAcct.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '火.钻石',
    });

    expect(res.result).toStrictEqual({
      domain: '钻石',
      name: '火',
      owner: doedotkoinDomainAcct.address,
      expiration: `${durationIncrements * 1770429035204 * 2}`,
      grace_period_end: `${durationIncrements * 1770429035204 * 3}`,
      sub_names_count: '0',
      locked_kap_tokens: '0'
    });

    res = await nameserviceContract.functions.mint({
      name: '心形物.火.钻石',
      duration_increments: 3,
      owner: user1.address,
      payment_from: user1.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '心形物.火.钻石',
    });

    expect(res.result).toStrictEqual({
      domain: '火.钻石',
      name: '心形物',
      owner: user1.address,
      expiration: `${durationIncrements * 1770429035204 * 2}`,
      grace_period_end: `${durationIncrements * 1770429035204 * 3}`,
      sub_names_count: '0',
      locked_kap_tokens: '0'
    });

    // check payment_from and payment_token_address can be used within a domain contract
    res = await nameserviceContract.functions.mint({
      name: 'kap.koin',
      duration_increments: durationIncrements,
      owner: doedotkoinDomainAcct.address,
      payment_from: doedotkoinDomainAcct.address,
      payment_token_address: koin.address
    }, {
      beforeSend: async (tx) => {
        await doedotkoinDomainAcct.signer.signTransaction(tx);
      },
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'kap.koin',
    });

    expect(res?.result?.domain).toEqual('koin');
    expect(res?.result?.name).toEqual('kap');
    expect(res?.result?.owner).toEqual(doedotkoinDomainAcct.address);

    // check that a name can be reclaimed when it is expired and the grace perdio has ended
    // in test domain contract, expiration and grace_period_end are set to duration_increments * now
    // so use duration_increments to change names's expiration and duration_increments
    res = await nameserviceContract.functions.mint({
      name: 'grace-period.koin',
      duration_increments: 1,
      owner: user1.address,
      payment_from: doedotkoinDomainAcct.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'grace-period.koin',
    });

    // should be reclaimable, meaning get_name doesn't not return anything
    expect(res?.result).toEqual(undefined);

    // reclaim name
    res = await nameserviceContract.functions.mint({
      name: 'grace-period.koin',
      duration_increments: 2,
      owner: user2.address,
      payment_from: doedotkoinDomainAcct.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'grace-period.koin',
    });

    // owner should now be user2
    expect(res?.result?.domain).toEqual('koin');
    expect(res?.result?.name).toEqual('grace-period');
    expect(res?.result?.owner).toEqual(user2.address);
  });

  it('should not mint TLAs / names', async () => {
    // @ts-ignore assertions exists
    expect.assertions(17);

    try {
      await nameserviceContract.functions.mint({
        name: 'koin',
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('missing "owner" argument');
    }

    // validate elements of a name
    try {
      await nameserviceContract.functions.mint({
        name: '-koin',
        owner: koinDomainAcct.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('element "-koin" cannot start with an hyphen (-)');
    }

    try {
      await nameserviceContract.functions.mint({
        name: 'koin-',
        owner: koinDomainAcct.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('element "koin-" cannot end with an hyphen (-)');
    }

    try {
      await nameserviceContract.functions.mint({
        name: 'doe--koin',
        owner: koinDomainAcct.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('element "doe--koin" cannot have consecutive hyphens (-)');
    }

    try {
      await nameserviceContract.functions.mint({
        name: '.koin',
        owner: koinDomainAcct.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('an element cannot be empty');
    }

    try {
      await nameserviceContract.functions.mint({
        name: '-doe.koin',
        owner: koinDomainAcct.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('element "-doe" cannot start with an hyphen (-)');
    }

    try {
      await nameserviceContract.functions.mint({
        name: 'doe-.koin',
        owner: koinDomainAcct.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('element "doe-" cannot end with an hyphen (-)');
    }

    try {
      await nameserviceContract.functions.mint({
        name: 'john--doe.koin',
        owner: koinDomainAcct.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('element "john--doe" cannot have consecutive hyphens (-)');
    }

    try {
      await nameserviceContract.functions.mint({
        name: '.doe.koin',
        owner: koinDomainAcct.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('an element cannot be empty');
    }

    // check a TLA can only be regsitered once
    try {
      await nameserviceContract.functions.mint({
        name: 'koin',
        owner: koinDomainAcct.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name "koin" is already taken');
    }

    // check that a domain contract can prevent a name from being minted
    try {
      await nameserviceContract.functions.mint({
        name: 'banned.koin',
        duration_increments: 3,
        owner: doedotkoinDomainAcct.address,
        payment_from: doedotkoinDomainAcct.address,
        payment_token_address: koin.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name "banned" cannot be used');
    }

    try {
      await nameserviceContract.functions.mint({
        name: 'my.ogrex',
        duration_increments: 3,
        owner: doedotkoinDomainAcct.address,
        payment_from: doedotkoinDomainAcct.address,
        payment_token_address: koin.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('domain "ogrex" does not exist');
    }

    try {
      await nameserviceContract.functions.mint({
        name: 'doe.koin',
        duration_increments: 3,
        owner: doedotkoinDomainAcct.address,
        payment_from: doedotkoinDomainAcct.address,
        payment_token_address: koin.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name "doe.koin" is already taken');
    }

    let res = await nameserviceContract.functions.mint({
      name: 'expired.koin',
      duration_increments: 3,
      owner: doedotkoinDomainAcct.address,
      payment_from: doedotkoinDomainAcct.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    // check that cannot mint if name is expired and grace_period has not ended yet
    try {
      await nameserviceContract.functions.mint({
        name: 'expired.koin',
        duration_increments: 3,
        owner: doedotkoinDomainAcct.address,
        payment_from: doedotkoinDomainAcct.address,
        payment_token_address: koin.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name "expired.koin" is already taken');
    }

    // check that cannot mint name on expired domain
    res = await nameserviceContract.functions.mint({
      name: 'expires-now.koin',
      duration_increments: 3,
      owner: doedotkoinDomainAcct.address,
      payment_from: doedotkoinDomainAcct.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    try {
      await nameserviceContract.functions.mint({
        name: 'test.expires-now.koin',
        duration_increments: 3,
        owner: doedotkoinDomainAcct.address,
        payment_from: doedotkoinDomainAcct.address,
        payment_token_address: koin.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('domain "expires-now.koin" does not exist');
    }

    // check that a name cannot be minted if a domain contract is not setup at the owner address

    res = await nameserviceContract.functions.mint({
      name: 'not-mintable.koin',
      duration_increments: 3,
      owner: user1.address,
      payment_from: doedotkoinDomainAcct.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    try {
      await nameserviceContract.functions.mint({
        name: 'i-am.not-mintable.koin',
        duration_increments: 3,
        owner: doedotkoinDomainAcct.address,
        payment_from: doedotkoinDomainAcct.address,
        payment_token_address: koin.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('contract does not exist');
    }

    // entry point does not exist
    await localKoinos.deployTokenContract(dummyToken.wif);

    res = await nameserviceContract.functions.mint({
      name: 'still-not-mintable.koin',
      duration_increments: 3,
      owner: dummyToken.address,
      payment_from: doedotkoinDomainAcct.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    try {
      await nameserviceContract.functions.mint({
        name: 'i-am.still-not-mintable.koin',
        duration_increments: 3,
        owner: doedotkoinDomainAcct.address,
        payment_from: doedotkoinDomainAcct.address,
        payment_token_address: koin.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('exit error did not contain error data');
    }
  });

  it('should lock KAP tokens when minting TLAs', async () => {
    // @ts-ignore assertions exists
    expect.assertions(7);

    // deploy kap token
    kapContract = await localKoinos.deployTokenContract(kapAcct.wif);
    let res = await kapContract.mint(user1.address, '1000');
    await res.transaction?.wait();

    // set nameservice metadata
    res = await nameserviceContract.functions.set_metadata({
      tla_mint_fee: '10',
      kap_token_address: kapAcct.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_metadata({});

    expect(res?.result?.tla_mint_fee).toEqual('10');
    expect(res?.result?.kap_token_address).toEqual(kapAcct.address);

    let bal = await kapContract.balanceOf(user1.address);
    expect(bal).toStrictEqual('1000');

    res = await nameserviceContract.functions.mint({
      name: 'notfree',
      owner: user1.address,
      payment_from: user1.address,
    }, {
      beforeSend: async (tx) => {
        // add user1 signature to allow transfering tokens
        await user1.signer.signTransaction(tx);
      }
    });

    await res.transaction.wait();

    bal = await kapContract.balanceOf(user1.address);
    expect(bal).toStrictEqual('990');

    res = await nameserviceContract.functions.get_name({
      name: 'notfree',
    });

    expect(res?.result?.domain).toEqual(undefined);
    expect(res.result).toStrictEqual({
      name: 'notfree',
      owner: user1.address,
      expiration: '0',
      grace_period_end: '0',
      sub_names_count: '0',
      locked_kap_tokens: '10'
    });

    try {
      await nameserviceContract.functions.mint({
        name: 'koin2',
        owner: user1.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('argument "payment_from" is missing');
    }

    // revert changes in nameservice metadata
    res = await nameserviceContract.functions.set_metadata({
      tla_mint_fee: '0',
      kap_token_address: kapAcct.address
    });
  });
});

describe('get_names', () => {
  it('should get names by owner', async () => {
    // ascending
    let res = await nameserviceContract.functions.get_names({
      owner: user1.address,
    });

    expect(res.result).toStrictEqual({
      names: [
        {
          domain: '🔥.💎',
          name: '❤️',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        },
        {
          domain: '火.钻石',
          name: '心形物',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        },
        {
          name: 'notfree',
          owner: user1.address,
          expiration: '0',
          grace_period_end: '0',
          sub_names_count: '0',
          locked_kap_tokens: '10'
        },
        {
          domain: 'koin',
          name: 'not-mintable',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        },
        {
          domain: 'doe.koin',
          name: 'john',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        }
      ]
    });

    res = await nameserviceContract.functions.get_names({
      owner: user1.address,
      name_offset: 'notfree',
      limit: 1
    });

    expect(res.result).toStrictEqual({
      names: [
        {
          domain: 'koin',
          name: 'not-mintable',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        },
      ]
    });

    res = await nameserviceContract.functions.get_names({
      owner: user1.address,
      name_offset: 'doe.koin'
    });

    expect(res.result).toStrictEqual(undefined);

    res = await nameserviceContract.functions.get_names({
      owner: doedotkoinDomainAcct.address,
      name_offset: 'expired.koin',
      limit: 1
    });

    expect(res.result).toStrictEqual({
      names: [
        {
          domain: 'koin',
          name: 'doe',
          owner: doedotkoinDomainAcct.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '1',
          locked_kap_tokens: '0'
        }
      ]
    });

    // descending
    res = await nameserviceContract.functions.get_names({
      owner: user1.address,
      descending: true
    });

    expect(res.result).toStrictEqual({
      names: [
        {
          domain: 'doe.koin',
          name: 'john',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        },
        {
          domain: 'koin',
          name: 'not-mintable',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        },
        {
          name: 'notfree',
          owner: user1.address,
          expiration: '0',
          grace_period_end: '0',
          sub_names_count: '0',
          locked_kap_tokens: '10'
        },
        {
          domain: '火.钻石',
          name: '心形物',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        },
        {
          domain: '🔥.💎',
          name: '❤️',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        }
      ]
    });

    res = await nameserviceContract.functions.get_names({
      owner: user1.address,
      name_offset: 'notfree',
      limit: 1,
      descending: true
    });

    expect(res.result).toStrictEqual({
      names: [
        {
          domain: '火.钻石',
          name: '心形物',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        }
      ]
    });

    res = await nameserviceContract.functions.get_names({
      owner: doedotkoinDomainAcct.address,
      name_offset: 'expired.koin',
      limit: 1,
      descending: true
    });

    expect(res.result).toStrictEqual({
      names: [
        {
          domain: '💎',
          name: '🔥',
          owner: doedotkoinDomainAcct.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '1',
          locked_kap_tokens: '0'
        }
      ]
    });
  });

  it('should not get names when expired', async () => {
    let res = await nameserviceContract.functions.mint({
      name: 'expires-now.koin',
      duration_increments: 3,
      owner: user1.address,
      payment_from: doedotkoinDomainAcct.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_names({
      owner: user1.address,
    });

    expect(res.result).toStrictEqual({
      names: [
        {
          domain: '🔥.💎',
          name: '❤️',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        },
        {
          domain: '火.钻石',
          name: '心形物',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        },
        {
          name: 'notfree',
          owner: user1.address,
          expiration: '0',
          grace_period_end: '0',
          sub_names_count: '0',
          locked_kap_tokens: '10'
        },
        {
          domain: 'koin',
          name: 'not-mintable',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        },
        {
          domain: 'doe.koin',
          name: 'john',
          owner: user1.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        }
      ]
    });
  });
});

describe('transfer', () => {
  it('should transfer a name', async () => {
    let res = await nameserviceContract.functions.mint({
      name: 'transfer.koin',
      duration_increments: 3,
      owner: user3.address,
      payment_from: user3.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'transfer.koin',
    });

    expect(res.result.owner).toStrictEqual(user3.address);

    res = await nameserviceContract.functions.get_names({
      owner: user3.address,
    });

    expect(res.result).toStrictEqual({
      names: [
        {
          domain: 'koin',
          name: 'transfer',
          owner: user3.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        }
      ]
    });

    res = await nameserviceContract.functions.get_names({
      owner: user4.address,
    });

    expect(res.result).toStrictEqual(undefined);

    res = await nameserviceContract.functions.transfer({
      name: 'transfer.koin',
      to: user4.address
    }, {
      beforeSend: async (tx) => {
        await user3.signer.signTransaction(tx);
      }
    });

    await res.transaction.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'transfer.koin',
    });

    expect(res.result.owner).toStrictEqual(user4.address);

    res = await nameserviceContract.functions.get_names({
      owner: user4.address,
    });

    expect(res.result).toStrictEqual({
      names: [
        {
          domain: 'koin',
          name: 'transfer',
          owner: user4.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        }
      ]
    });

    res = await nameserviceContract.functions.get_names({
      owner: user3.address,
    });

    expect(res.result).toStrictEqual(undefined);
  });

  it('should not transfer a name', async () => {
    try {
      await nameserviceContract.functions.transfer({
        name: 'transfer.koin'
      }, {
        beforeSend: async (tx) => {
          await user3.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('missing "to" argument');
    }

    try {
      await nameserviceContract.functions.transfer({
        name: 'i-dont-exist.koin',
        to: user4.address
      }, {
        beforeSend: async (tx) => {
          await user3.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name "i-dont-exist.koin" does not exist');
    }

    try {
      await nameserviceContract.functions.transfer({
        name: 'transfer.koin',
        to: user3.address
      }, {
        beforeSend: async (tx) => {
          await user3.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name owner has not authorized transfer');
    }

    // when expired
    let res = await nameserviceContract.functions.mint({
      name: 'expires-now.koin',
      duration_increments: 3,
      owner: user4.address,
      payment_from: user4.address,
      payment_token_address: koin.address
    });

    await res.transaction.wait();

    try {
      await nameserviceContract.functions.transfer({
        name: 'expires-now.koin',
        to: user4.address,
      }, {
        beforeSend: async (tx) => {
          await doedotkoinDomainAcct.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name "expires-now.koin" does not exist');
    }
  });
});

describe('burn', () => {
  it('should burn a name', async () => {
    let res = await nameserviceContract.functions.mint({
      name: 'burn.koin',
      duration_increments: 3,
      owner: user3.address,
      payment_from: user3.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'burn.koin',
    });

    expect(res.result.owner).toStrictEqual(user3.address);

    res = await nameserviceContract.functions.get_names({
      owner: user3.address,
    });

    expect(res.result).toStrictEqual({
      names: [
        {
          domain: 'koin',
          name: 'burn',
          owner: user3.address,
          expiration: '10622574211224',
          grace_period_end: '15933861316836',
          sub_names_count: '0',
          locked_kap_tokens: '0'
        }
      ]
    });

    res = await nameserviceContract.functions.burn({
      name: 'burn.koin',
    }, {
      beforeSend: async (tx) => {
        await user3.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'burn.koin',
    });

    expect(res.result).toStrictEqual(undefined);

    res = await nameserviceContract.functions.get_names({
      owner: user3.address,
    });

    expect(res.result).toStrictEqual(undefined);

    // check that TLA fees are returned
    let bal = await kapContract.balanceOf(user1.address);
    expect(bal).toStrictEqual('990');

    res = await nameserviceContract.functions.burn({
      name: 'notfree',
      owner: user1.address,
      payment_from: user1.address,
    }, {
      beforeSend: async (tx) => {
        await user1.signer.signTransaction(tx);
      }
    });

    await res.transaction.wait();

    bal = await kapContract.balanceOf(user1.address);
    expect(bal).toStrictEqual('1000');

    res = await nameserviceContract.functions.get_name({
      name: 'notfree',
    });

    expect(res?.result).toEqual(undefined);
  });

  it('should not burn a name', async () => {
    try {
      await nameserviceContract.functions.burn({
        name: 'i-dont-exist.koin',
      }, {
        beforeSend: async (tx) => {
          await user3.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name "i-dont-exist.koin" does not exist');
    }

    try {
      await nameserviceContract.functions.burn({
        name: 'transfer.koin',
      }, {
        beforeSend: async (tx) => {
          await user3.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name owner has not authorized burn');
    }

    try {
      await nameserviceContract.functions.burn({
        name: 'koin',
      }, {
        beforeSend: async (tx) => {
          await koinDomainAcct.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name "koin" cannot be burned because sub names exist');
    }

    // check that domain contracts can prevent burning names
    let res = await nameserviceContract.functions.mint({
      name: 'cannot-burn.koin',
      duration_increments: 3,
      owner: user1.address,
      payment_from: user1.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'cannot-burn.koin',
    });

    expect(res.result.owner).toStrictEqual(user1.address);

    try {
      await nameserviceContract.functions.burn({
        name: 'cannot-burn.koin',
      }, {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name "cannot-burn" cannot be burned');
    }
  });
});

describe('renew', () => {
  it('should renew a name', async () => {
    let res = await nameserviceContract.functions.get_name({
      name: 'john.doe.koin',
    });

    expect(res?.result).toStrictEqual({
      domain: 'doe.koin',
      name: 'john',
      owner: user1.address,
      expiration: '10622574211224',
      grace_period_end: '15933861316836',
      sub_names_count: '0',
      locked_kap_tokens: '0'
    });

    res = await nameserviceContract.functions.renew({
      name: 'john.doe.koin',
      duration_increments: 3,
      payment_from: user3.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'john.doe.koin',
    });

    expect(res?.result).toStrictEqual({
      domain: 'doe.koin',
      name: 'john',
      owner: user1.address,
      expiration: '1770428796867',
      grace_period_end: '1770428796869',
      sub_names_count: '0',
      locked_kap_tokens: '0'
    });
  });

  it('should not renew a name', async () => {
    let res = await nameserviceContract.functions.mint({
      name: 'cannot-renew.koin',
      duration_increments: 3,
      owner: user1.address,
      payment_from: user1.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    try {
      await nameserviceContract.functions.renew({
        name: 'cannot-renew.koin',
        duration_increments: 3,
        payment_from: user1.address,
        payment_token_address: koin.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name "cannot-renew" cannot be renewed');
    }

    try {
      await nameserviceContract.functions.renew({
        name: 'i-dont-exist.koin',
        duration_increments: 3,
        payment_from: user3.address,
        payment_token_address: koin.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('name "i-dont-exist.koin" does not exist');
    }

    res = await nameserviceContract.functions.mint({
      name: 'never-expires.koin',
      duration_increments: 3,
      owner: user1.address,
      payment_from: user1.address,
      payment_token_address: koin.address
    });

    await res.transaction?.wait();

    try {
      await nameserviceContract.functions.renew({
        name: 'never-expires.koin',
        duration_increments: 3,
        payment_from: user1.address,
        payment_token_address: koin.address
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('cannot renew "never-expires.koin" because it cannot expire');
    }
  });
});