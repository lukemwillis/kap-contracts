/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Contract, LocalKoinos, Token } from '@roamin/local-koinos';

import * as abi from '../abi/multisig-abi.json';

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
  multisigAcct,
  koinDomainAcct,
  user1,
  user2,
  user3,
  user4,
] = localKoinos.getAccounts();

let multisigContract: Contract;
let koindomainContract: Contract;

const durationIncrements = 3;

beforeAll(async () => {
  // start local-koinos node
  await localKoinos.startNode();

  await localKoinos.deployKoinContract({ mode: 'manual' });
  await localKoinos.mintKoinDefaultAccounts({ mode: 'manual' });
  await localKoinos.deployNameServiceContract({ mode: 'manual' });
  await localKoinos.setNameServiceRecord('koin', koin.address, { mode: 'manual' });

  // deploy multisig 
  multisigContract = await localKoinos.deployContract(
    multisigAcct.wif,
    './build/release/contract.wasm',
    // @ts-ignore abi is compatible
    abi,
    { mode: 'manual' },
    // override authorizations
    {
      authorizesCallContract: true,
      authorizesTransactionApplication: true,
      authorizesUploadContract: true
    }
  );

  // deploy koindomain  
  await localKoinos.deployContract(
    koinDomainAcct.wif,
    '../koin-domain/build/release/contract.wasm',
    // @ts-ignore abi is compatible
    abi,
    { mode: 'manual' }
  );

  await localKoinos.startBlockProduction();
});

afterAll(async () => {
  // stop local-koinos node
  await localKoinos.stopNode();
});

describe('signers management', () => {
  it('should add and remove signers', async () => {
    // expect.assertions(1);

    // add signer
    let res = await multisigContract.functions.add_signer({
      signer: user1.address
    });

    await res.transaction?.wait();

    res = await multisigContract.functions.get_signers({});

    expect(res.result).toStrictEqual(
      {
        authorized_signers: [user1.address]
      }
    );

    // user1 should be able to add user2
    res = await multisigContract.functions.add_signer({
      signer: user2.address
    }, {
      beforeSend: async (tx) => {
        await user1.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();

    res = await multisigContract.functions.get_signers({});

    expect(res.result).toStrictEqual(
      {
        authorized_signers: expect.arrayContaining([
          user1.address,
          user2.address
        ])
      }
    );

    // user1 and user2 should be able to add user3
    res = await multisigContract.functions.add_signer({
      signer: user3.address
    }, {
      beforeSend: async (tx) => {
        await user1.signer.signTransaction(tx);
        await user2.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();

    res = await multisigContract.functions.get_signers({});

    expect(res.result).toStrictEqual(
      {
        authorized_signers: expect.arrayContaining([
          user1.address,
          user2.address,
          user3.address
        ])
      }
    );

    // user2 and user3 should be able to remove user1
    res = await multisigContract.functions.remove_signer({
      signer: user1.address
    }, {
      beforeSend: async (tx) => {
        await user2.signer.signTransaction(tx);
        await user3.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();

    res = await multisigContract.functions.get_signers({});

    expect(res.result).toStrictEqual(
      {
        authorized_signers: expect.arrayContaining([
          user2.address,
          user3.address
        ])
      }
    );

    expect(res.result).toStrictEqual(
      {
        authorized_signers: expect.not.arrayContaining([
          user1.address,
        ])
      }
    );

    // user3 should be able to remove user2
    res = await multisigContract.functions.remove_signer({
      signer: user2.address
    }, {
      beforeSend: async (tx) => {
        await user3.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();

    res = await multisigContract.functions.get_signers({});

    expect(res.result).toStrictEqual(
      {
        authorized_signers: expect.arrayContaining([
          user3.address
        ])
      }
    );

    expect(res.result).toStrictEqual(
      {
        authorized_signers: expect.not.arrayContaining([
          user1.address,
          user2.address
        ])
      }
    );

    // multisigContractAcct should be able to remove user3
    res = await multisigContract.functions.remove_signer({
      signer: user3.address
    });

    await res.transaction?.wait();

    res = await multisigContract.functions.get_signers({});

    expect(res.result).toBeUndefined();
  });
});