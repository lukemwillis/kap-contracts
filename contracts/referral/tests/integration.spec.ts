/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Contract, LocalKoinos, Serializer, Signer, Token, utils } from '@roamin/local-koinos';

import * as abi from '../abi/referral-abi.json';

// @ts-ignore koilib_types is needed when using koilib
abi.koilib_types = abi.types;

jest.setTimeout(600000);

const serializer = new Serializer(abi.types);

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
  referralAcct,
  user1,
  user2
] = localKoinos.getAccounts();

let referralContract: Contract;


beforeAll(async () => {
  // start local-koinos node
  await localKoinos.startNode();

  await localKoinos.deployKoinContract({ mode: 'manual' });
  await localKoinos.mintKoinDefaultAccounts({ mode: 'manual' });
  await localKoinos.deployNameServiceContract({ mode: 'manual' });
  await localKoinos.setNameServiceRecord('koin', koin.address, { mode: 'manual' });

  // deploy referral contract 
  referralContract = await localKoinos.deployContract(
    referralAcct.wif,
    './build/release/contract.wasm',
    // @ts-ignore abi is compatible
    abi,
    { mode: 'manual' },
  );

  await localKoinos.startBlockProduction();
});

afterAll(async () => {
  // stop local-koinos node
  await localKoinos.stopNode();
});

async function generateReferralCode(
  signer: Signer,
  chain_id: string,
  expiration_date: string,
  allowed_redemption_account = '',
  allowed_redemption_contract = '',
  data = ''
) {
  const metadata = {
    chain_id,
    issuer: signer.address,
    expiration_date,
    allowed_redemption_account,
    allowed_redemption_contract,
    data
  };

  const serializedMetadata = await referralContract.serializer.serialize(metadata, 'referral.referral_code_metadata');
  const signature = await signer.signMessage(serializedMetadata);

  return {
    metadata,
    signature: utils.encodeBase64url(signature)
  };
}

describe('referral', () => {
  it('redeems a referral code', async () => {
    const chain_id = await referralContract.provider.getChainId();

    let referral_code = await generateReferralCode(
      user1.signer,
      chain_id,
      (new Date().getTime() + 10000).toString()
    );

    // should not get a code that's not redeemed
    let res = await referralContract.functions.get_referral_code({
      referral_code
    });

    expect(res.result).toBeUndefined();

    res = await referralContract.functions.redeem({
      referral_code
    });

    await res.transaction?.wait();

    // should get the redeemed code
    res = await referralContract.functions.get_referral_code({
      referral_code
    });

    expect(res.result).toEqual(referral_code);
  });

  it('only allows allowed_redemption_account to redeem a referral code', async () => {
    expect.assertions(2);

    const chain_id = await referralContract.provider.getChainId();

    let referral_code = await generateReferralCode(
      user1.signer,
      chain_id,
      (new Date().getTime() + 10000).toString(),
      user2.address
    );

    try {
      await referralContract.functions.redeem({
        referral_code
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('allowed_redemption_account has not authorized the redemption of this referral code');
    }

    let res = await referralContract.functions.redeem({
      referral_code
    }, {
      beforeSend: async (tx) => {
        await user2.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();

    // should get the redeemed code
    res = await referralContract.functions.get_referral_code({
      referral_code
    });

    expect(res.result).toEqual(referral_code);
  });

  it('does not allow the redemption of invalid codes', async () => {
    expect.assertions(10);

    const chain_id = await referralContract.provider.getChainId();

    try {
      await referralContract.functions.redeem({

      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('missing "referral_code" argument');
    }

    try {
      await referralContract.functions.redeem({
        referral_code: {

        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('missing "referral_code.metadata" argument');
    }

    try {
      await referralContract.functions.redeem({
        referral_code: {
          metadata: {

          }
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('missing "referral_code.metadata.issuer" argument');
    }

    try {
      await referralContract.functions.redeem({
        referral_code: {
          metadata: {
            issuer: user1.address,
            chain_id: utils.encodeBase64url(Buffer.from('invalid chain id'))
          }
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('invalid "chain_id"');
    }

    try {
      await referralContract.functions.redeem({
        referral_code: {
          metadata: {
            issuer: user1.address,
            chain_id,
            expiration_date: '1'
          }
        }
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('referral code expired');
    }

    let referral_code = await generateReferralCode(
      user1.signer,
      chain_id,
      (new Date().getTime() + 10000).toString()
    );

    let res = await referralContract.functions.redeem({
      referral_code
    });

    await res.transaction.wait();

    try {
      await referralContract.functions.redeem({
        referral_code
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('referral code already redeemed');
    }

    referral_code = await generateReferralCode(
      user1.signer,
      chain_id,
      (new Date().getTime() + 10000).toString()
    );

    const { expiration_date } = referral_code.metadata;

    referral_code.metadata.issuer = user2.address;

    try {
      await referralContract.functions.redeem({
        referral_code
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('invalid signature');
    }

    referral_code.metadata.issuer = user1.address;
    referral_code.metadata.expiration_date = (new Date().getTime() + 100000).toString();

    try {
      await referralContract.functions.redeem({
        referral_code
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('invalid signature');
    }

    referral_code.metadata.expiration_date = expiration_date;
    referral_code.signature = '';

    try {
      await referralContract.functions.redeem({
        referral_code
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('unexpected signature length');
    }

    referral_code.signature = utils
      .encodeBase64url(
        await user2.signer.signMessage(
          await referralContract.serializer.serialize(
            referral_code.metadata,
            'referral.referral_code_metadata'
          )
        )
      );

    try {
      await referralContract.functions.redeem({
        referral_code
      });
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual('invalid signature');
    }
  });
});