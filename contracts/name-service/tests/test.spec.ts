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

test("test1", async () => {
  const [genesis, koin, acct1, acct2] = localKoinos.getAccounts();

  // deploy nameservice 
  // @ts-ignore abi is compatible
  const contract = await localKoinos.deployContract(acct1.wif, './build/debug/contract.wasm', abi);

  const { result } = await contract.functions.test({  });
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