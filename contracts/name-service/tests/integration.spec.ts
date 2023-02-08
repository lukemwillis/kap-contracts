/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LocalKoinos, Token, Signer } from '@roamin/local-koinos';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore 
import * as abi from '../abi/nameservice-abi.json';

// @ts-ignore koilib_types is needed when using koilib
abi.koilib_types = abi.types;

jest.setTimeout(600000);

const localKoinos = new LocalKoinos({
  rpc: 'http://host.docker.internal:8080',
  amqp: 'amqp://host.docker.internal:5672'
});

beforeAll(async () => {
  // start local-koinos node
  await localKoinos.startNode();
  await localKoinos.startBlockProduction();

  await localKoinos.deployKoinContract();
  await localKoinos.mintKoinDefaultAccounts();
  await localKoinos.deployNameServiceContract();
  const [genesis, koin] = localKoinos.getAccounts();
  await localKoinos.setNameServiceRecord('koin', koin.address);
});

afterAll(async () => {
  // stop local-koinos node
  await localKoinos.stopNode();
});

describe('mint', () => {
  test("it should mint TLAs, names and sub names", async () => {
    const [
      genesis,
      koin,
      nameserviceAcct,
      koinDomainAcct,
      doedotkoinDomainAcct,
      user1
    ] = localKoinos.getAccounts();

    // deploy nameservice 
    // @ts-ignore abi is compatible
    const nameserviceContract = await localKoinos.deployContract(nameserviceAcct.wif, './build/debug/contract.wasm', abi);

    // deploy koindomain  
    // @ts-ignore abi is compatible
    const koindomainContract = await localKoinos.deployContract(koinDomainAcct.wif, '../test-domain/build/debug/contract.wasm', abi);

    // deploy doe.koin  
    // @ts-ignore abi is compatible
    const doedotkoinDomainContract = await localKoinos.deployContract(doedotkoinDomainAcct.wif, '../test-domain/build/debug/contract.wasm', abi);

    // ASCII characters
    let res = await nameserviceContract.functions.mint({
      name: 'koin',
      owner: koinDomainAcct.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'koin',
    });

    expect(res?.result?.domain).toBe(undefined);
    expect(res?.result?.name).toBe('koin');
    expect(res?.result?.owner).toBe(koinDomainAcct.address);
    expect(res?.result?.expiration).toBe('0');
    expect(res?.result?.grace_period_end).toBe('0');
    expect(res?.result?.sub_names_count).toBe('0');
    expect(res?.result?.locked_kap_tokens).toBe('0');

    const durationIncrements = 3;

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

    expect(res?.result?.domain).toBe('koin');
    expect(res?.result?.name).toBe('doe');
    expect(res?.result?.owner).toBe(doedotkoinDomainAcct.address);
    expect(res?.result?.expiration).toBe(`${durationIncrements * 1770429035204 * 2}`);
    expect(res?.result?.grace_period_end).toBe(`${durationIncrements * 1770429035204 * 3}`);
    expect(res?.result?.sub_names_count).toBe('0');
    expect(res?.result?.locked_kap_tokens).toBe('0');

    // check sub_names_count incremented on koin domain
    res = await nameserviceContract.functions.get_name({
      name: 'koin',
    });

    expect(res?.result?.sub_names_count).toBe('1');

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

    expect(res?.result?.domain).toBe('doe.koin');
    expect(res?.result?.name).toBe('john');
    expect(res?.result?.owner).toBe(user1.address);
    expect(res?.result?.expiration).toBe(`${durationIncrements * 1770429035204 * 2}`);
    expect(res?.result?.grace_period_end).toBe(`${durationIncrements * 1770429035204 * 3}`);
    expect(res?.result?.sub_names_count).toBe('0');
    expect(res?.result?.locked_kap_tokens).toBe('0');

    // emojis
    res = await nameserviceContract.functions.mint({
      name: '💎',
      owner: koinDomainAcct.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '💎',
    });

    expect(res?.result?.domain).toBe(undefined);
    expect(res?.result?.name).toBe('💎');
    expect(res?.result?.owner).toBe(koinDomainAcct.address);
    expect(res?.result?.expiration).toBe('0');
    expect(res?.result?.grace_period_end).toBe('0');
    expect(res?.result?.sub_names_count).toBe('0');
    expect(res?.result?.locked_kap_tokens).toBe('0');


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

    expect(res?.result?.domain).toBe('💎');
    expect(res?.result?.name).toBe('🔥');
    expect(res?.result?.owner).toBe(doedotkoinDomainAcct.address);
    expect(res?.result?.expiration).toBe(`${durationIncrements * 1770429035204 * 2}`);
    expect(res?.result?.grace_period_end).toBe(`${durationIncrements * 1770429035204 * 3}`);
    expect(res?.result?.sub_names_count).toBe('0');
    expect(res?.result?.locked_kap_tokens).toBe('0');

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

    expect(res?.result?.domain).toBe('🔥.💎');
    expect(res?.result?.name).toBe('❤️');
    expect(res?.result?.owner).toBe(user1.address);
    expect(res?.result?.expiration).toBe(`${durationIncrements * 1770429035204 * 2}`);
    expect(res?.result?.grace_period_end).toBe(`${durationIncrements * 1770429035204 * 3}`);
    expect(res?.result?.sub_names_count).toBe('0');
    expect(res?.result?.locked_kap_tokens).toBe('0');

    // Chinese characters
    res = await nameserviceContract.functions.mint({
      name: '钻石',
      owner: koinDomainAcct.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: '钻石',
    });

    expect(res?.result?.domain).toBe(undefined);
    expect(res?.result?.name).toBe('钻石');
    expect(res?.result?.owner).toBe(koinDomainAcct.address);
    expect(res?.result?.expiration).toBe('0');
    expect(res?.result?.grace_period_end).toBe('0');
    expect(res?.result?.sub_names_count).toBe('0');
    expect(res?.result?.locked_kap_tokens).toBe('0');


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

    expect(res?.result?.domain).toBe('钻石');
    expect(res?.result?.name).toBe('火');
    expect(res?.result?.owner).toBe(doedotkoinDomainAcct.address);
    expect(res?.result?.expiration).toBe(`${durationIncrements * 1770429035204 * 2}`);
    expect(res?.result?.grace_period_end).toBe(`${durationIncrements * 1770429035204 * 3}`);
    expect(res?.result?.sub_names_count).toBe('0');
    expect(res?.result?.locked_kap_tokens).toBe('0');

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

    expect(res?.result?.domain).toBe('火.钻石');
    expect(res?.result?.name).toBe('心形物');
    expect(res?.result?.owner).toBe(user1.address);
    expect(res?.result?.expiration).toBe(`${durationIncrements * 1770429035204 * 2}`);
    expect(res?.result?.grace_period_end).toBe(`${durationIncrements * 1770429035204 * 3}`);
    expect(res?.result?.sub_names_count).toBe('0');
    expect(res?.result?.locked_kap_tokens).toBe('0');
  });

  test("it should lock KAP tokens when minting TLAs", async () => {
    const [
      genesis,
      koin,
      nameserviceAcct,
      koinDomainAcct,
      kapAcct,
      user1
    ] = localKoinos.getAccounts();

    // deploy nameservice 
    // @ts-ignore abi is compatible
    const nameserviceContract = await localKoinos.deployContract(nameserviceAcct.wif, './build/debug/contract.wasm', abi);


    // deploy kap token
    const kapContract = await localKoinos.deployTokenContract(kapAcct.wif);
    let res = await kapContract.mint(user1.address, '1000');
    await res.transaction?.wait();

    // set nameservice metadata
    res = await nameserviceContract.functions.set_metadata({
      tla_mint_fee: '10',
      kap_token_address: kapAcct.address
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_metadata({});

    expect(res?.result?.tla_mint_fee).toBe('10');
    expect(res?.result?.kap_token_address).toBe(kapAcct.address);

    res = await nameserviceContract.functions.mint({
      name: 'notfree',
      owner: koinDomainAcct.address,
      payment_from: user1.address,
    }, {
      sendTransaction: false
    });

    // add user1 signature to allow transfering tokens
    const signedTx = await user1.signer.signTransaction(res.transaction);

    const sendTxRes = await localKoinos.provider.sendTransaction(signedTx);
    await sendTxRes.transaction.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'notfree',
    });

    expect(res?.result?.domain).toBe(undefined);
    expect(res?.result?.name).toBe('notfree');
    expect(res?.result?.owner).toBe(koinDomainAcct.address);
    expect(res?.result?.expiration).toBe('0');
    expect(res?.result?.grace_period_end).toBe('0');
    expect(res?.result?.sub_names_count).toBe('0');
    expect(res?.result?.locked_kap_tokens).toBe('10');    

  });
});