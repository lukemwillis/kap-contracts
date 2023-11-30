/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Contract, LocalKoinos, Token } from '@roamin/local-koinos';

import * as multisigAbi from '../abi/multisig-abi.json';
import * as koindomainAbi from '../../koin-domain/abi/koindomain-abi.json';

// @ts-ignore koilib_types is needed when using koilib
multisigAbi.koilib_types = multisigAbi.types;
// @ts-ignore koilib_types is needed when using koilib
koindomainAbi.koilib_types = koindomainAbi.types;

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
  nameserviceAcct,
  usdOracleAcct
] = localKoinos.getAccounts();

let multisigContract: Contract;
let koinDomainContract: Contract;

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
    multisigAbi,
    { mode: 'manual' },
    // override authorizations
    {
      authorizesCallContract: true,
      authorizesTransactionApplication: true,
      authorizesUploadContract: true
    }
  );

  // deploy koindomain  
  koinDomainContract = await localKoinos.deployContract(
    koinDomainAcct.wif,
    '../koin-domain/build/release/contract.wasm',
    // @ts-ignore abi is compatible
    koindomainAbi,
    { mode: 'manual' },
    // override authorizations
    {
      authorizesCallContract: true,
      authorizesTransactionApplication: true,
      authorizesUploadContract: true
    }
  );

  await localKoinos.startBlockProduction();
});

afterAll(async () => {
  // stop local-koinos node
  await localKoinos.stopNode();
});

describe('signers management', () => {
  it('should add and remove signers', async () => {
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

  it('should fail multi-sig verification', async () => {
    expect.assertions(6);

    // fails if don't have the contract acct sig when there are not authorized signers setup
    try {
      multisigContract.signer = user1.signer;
      await multisigContract.functions.add_signer({
        signer: user1.address,
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(`account '${multisigAcct.address}' authorization failed`);
    }

    multisigContract.signer = multisigAcct.signer;
    let res = await multisigContract.functions.add_signer({
      signer: user1.address,
    });

    await res.transaction?.wait();

    // fails if provide contract acct sig but no authorized signers
    try {
      await multisigContract.functions.add_signer({
        signer: user1.address,
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('multi-signature verification failed, only 0/1 valid signatures provided');
    }

    res = await multisigContract.functions.add_signer({
      signer: user2.address,
    }, {
      beforeSend: async (tx) => {
        await user1.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();

    // fails if don't provide enough authorized signatures
    try {
      await multisigContract.functions.add_signer({
        signer: user3.address,
      }, {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('multi-signature verification failed, only 1/2 valid signatures provided');
    }

    try {
      await multisigContract.functions.add_signer({
        signer: user3.address,
      }, {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
          await user3.signer.signTransaction(tx);
          await user4.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('multi-signature verification failed, only 1/2 valid signatures provided');
    }

    try {
      await multisigContract.functions.add_signer({
      }, {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
          await user2.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('missing "signer" argument');
    }

    try {
      await multisigContract.functions.remove_signer({
        signer: user3.address,
      }, {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
          await user2.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('signer being removed is not an authorized signer');
    }
  });
});

describe('multi-sig contract ownership', () => {
  it('requires multi-sig when used as owner', async () => {
    expect.assertions(15);

    // set koin domain contract metadata
    let res = await koinDomainContract.functions.set_metadata({
      metadata: {
        nameservice_address: nameserviceAcct.address,
        oracle_address: usdOracleAcct.address,
        owner: multisigAcct.address
      }
    });

    await res.transaction?.wait();

    res = await koinDomainContract.functions.get_metadata({});

    expect(res?.result?.nameservice_address).toEqual(nameserviceAcct.address);
    expect(res?.result?.oracle_address).toEqual(usdOracleAcct.address);
    expect(res?.result?.owner).toEqual(multisigAcct.address);

    // can consume mana and call a contract using multi-sig
    res = await koinDomainContract.functions.set_metadata({
      metadata: {
        nameservice_address: nameserviceAcct.address,
        oracle_address: user4.address,
        owner: multisigAcct.address
      }
    }, {
      beforeSend: async (tx) => {
        tx.signatures = [];
        await user1.signer.signTransaction(tx);
        await user2.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();

    res = await koinDomainContract.functions.get_metadata({});

    expect(res?.result?.nameservice_address).toEqual(nameserviceAcct.address);
    expect(res?.result?.oracle_address).toEqual(user4.address);
    expect(res?.result?.owner).toEqual(multisigAcct.address);

    // can upload a contract using multi-sig
    res = await koinDomainContract.deploy({
      authorizesCallContract: true,
      authorizesTransactionApplication: true,
      authorizesUploadContract: true,
      beforeSend: async (tx) => {
        tx.signatures = [];
        await user1.signer.signTransaction(tx);
        await user2.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();
    expect(res.receipt).not.toBeUndefined();

    // can transfer tokens
    res = await localKoinos.koin.transfer(
      koinDomainAcct.address,
      user4.address,
      '1'
      , {
        payer: koinDomainAcct.address,
        beforeSend: async (tx) => {
          tx.signatures = [];
          await user1.signer.signTransaction(tx);
          await user2.signer.signTransaction(tx);
        }
      });


    await res.transaction?.wait();

    const user4Bal = await localKoinos.koin.balanceOf(user4.address);
    expect(user4Bal).toEqual('5000000000001');

    const koinDomainBal = await localKoinos.koin.balanceOf(koinDomainAcct.address);
    expect(koinDomainBal).toEqual('4999999999999');

    try {
      // cannot consume mana
      await koinDomainContract.functions.set_metadata({
        metadata: {
          nameservice_address: nameserviceAcct.address,
          oracle_address: user4.address,
          owner: multisigAcct.address
        }
      }, {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('multi-signature verification failed, only 1/2 valid signatures provided');
    }

    try {
      // cannot consume mana
      await koinDomainContract.functions.set_metadata({
        metadata: {
          nameservice_address: nameserviceAcct.address,
          oracle_address: user4.address,
          owner: multisigAcct.address
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(`account ${koinDomainAcct.address} has not authorized transaction`);
    }

    try {
      // cannot upload contract
      await koinDomainContract.deploy({
        authorizesCallContract: true,
        authorizesTransactionApplication: true,
        authorizesUploadContract: true,
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('multi-signature verification failed, only 1/2 valid signatures provided');
    }

    try {
      // cannot upload contract
      await koinDomainContract.deploy({
        authorizesCallContract: true,
        authorizesTransactionApplication: true,
        authorizesUploadContract: true
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(`account ${koinDomainAcct.address} has not authorized transaction`);
    }

    try {
      // cannot transfer tokens
      await localKoinos.koin.transfer(
        koinDomainAcct.address,
        user4.address,
        '1'
        , {
          payer: koinDomainAcct.address,
          beforeSend: async (tx) => {
            await user1.signer.signTransaction(tx);
          }
        });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('multi-signature verification failed, only 1/2 valid signatures provided');
    }

    try {
      // cannot transfer tokens
      await localKoinos.koin.transfer(
        koinDomainAcct.address,
        user4.address,
        '1'
        , {
          payer: koinDomainAcct.address
        });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(`account ${koinDomainAcct.address} has not authorized transaction`);
    }
  });
});