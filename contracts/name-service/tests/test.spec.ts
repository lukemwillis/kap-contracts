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
});

afterAll(async () => {
  // stop local-koinos node
  await localKoinos.stopNode();
});

test("registration", async () => {
  const [genesis, koin, nameserviceAcct, koinDomainAcct, doedotkoinDomainAcct, user1] = localKoinos.getAccounts();

  // deploy nameservice 
  // @ts-ignore abi is compatible
  const nameserviceContract = await localKoinos.deployContract(nameserviceAcct.wif, './build/debug/contract.wasm', abi);

  // deploy koindomain  
  // @ts-ignore abi is compatible
  const koindomainContract = await localKoinos.deployContract(koinDomainAcct.wif, '../koin-domain/build/debug/contract.wasm', abi);

  // deploy doe.koin  
  // @ts-ignore abi is compatible
  const doedotkoinDomainContract = await localKoinos.deployContract(doedotkoinDomainAcct.wif, '../koin-domain/build/debug/contract.wasm', abi);


  let res = await nameserviceContract.functions.register({
    name: 'koin',
    owner: koinDomainAcct.address
  });

  await res.transaction?.wait();

  res = await nameserviceContract.functions.get_name({
    name: 'koin',
  });

  expect(res?.result?.name).toBe('koin');
  expect(res?.result?.owner).toBe(koinDomainAcct.address);
  expect(res?.result?.expiration).toBe('0');

  res = await nameserviceContract.functions.register({
    name: 'doe.koin',
    duration_increments: 3,
    owner: doedotkoinDomainAcct.address
  });

  await res.transaction?.wait();

  res = await nameserviceContract.functions.get_name({
    name: 'doe.koin',
  });

  expect(res?.result?.name).toBe('doe');
  expect(res?.result?.domain).toBe('koin');
  expect(res?.result?.owner).toBe(doedotkoinDomainAcct.address);

  res = await nameserviceContract.functions.register({
    name: 'john.doe.koin',
    duration_increments: 3,
    owner: user1.address
  });

  await res.transaction?.wait();

  res = await nameserviceContract.functions.get_name({
    name: 'john.doe.koin',
  });

  expect(res?.result?.name).toBe('john');
  expect(res?.result?.domain).toBe('doe.koin');
  expect(res?.result?.owner).toBe(user1.address);

  // expect(result?.value).toBe('9');

  // const signer = Signer.fromWif('L59UtJcTdNBnrH2QSBA5beSUhRufRu3g6tScDTite6Msuj7U93tM');
  // signer.provider = localKoinos.getProvider();
  // let tkn = new Token(localKoinos.koin.address(), signer);

  // try {
  //   await tkn.mint(signer.address, 40);
  // } catch (error) {
  //   expect(error.message).toContain('can only mint token with contract authority');
  // }
});