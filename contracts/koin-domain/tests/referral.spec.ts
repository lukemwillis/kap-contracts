/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Contract, LocalKoinos, Signer, Token, utils } from '@roamin/local-koinos';

// ABIs
import * as koindomainAbi from '../abi/koindomain-abi.json';
import * as nameserviceAbi from '../../name-service/abi/collections-abi.json';
import * as usdOracleAbi from '../../usd-oracle/abi/usdoracle-abi.json';
import * as collectionAbi from '../../test-collection/abi/testcollection-abi.json';
import * as referralAbi from '../../referral/abi/referral-abi.json';

// @ts-ignore koilib_types is needed when using koilib
koindomainAbi.koilib_types = koindomainAbi.types;
// @ts-ignore koilib_types is needed when using koilib
nameserviceAbi.koilib_types = nameserviceAbi.types;
// @ts-ignore koilib_types is needed when using koilib
usdOracleAbi.koilib_types = usdOracleAbi.types;
// @ts-ignore koilib_types is needed when using koilib
collectionAbi.koilib_types = collectionAbi.types;
// @ts-ignore koilib_types is needed when using koilib
referralAbi.koilib_types = referralAbi.types;

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
  user4,
  collectionAcct,
  referralAcct,
] = localKoinos.getAccounts();

let koinDomainContract: Contract;
let nameserviceContract: Contract;
let usdOracleContract: Contract;
let collectionContract: Contract;
let referralContract: Contract;

beforeAll(async () => {
  // start local-koinos node
  await localKoinos.startNode();

  await localKoinos.deployKoinContract({ mode: 'manual' });
  await localKoinos.mintKoinDefaultAccounts({ mode: 'manual' });
  await localKoinos.deployNameServiceContract({ mode: 'manual' });
  await localKoinos.setNameServiceRecord('koin', koin.address, { mode: 'manual' });

  // deploy koin domain 
  // @ts-ignore abi is compatible
  koinDomainContract = await localKoinos.deployContract(koinDomainAcct.wif, './build/release/contract.wasm', koindomainAbi, { mode: 'manual' });

  // deploy nameservice  
  // @ts-ignore abi is compatible
  nameserviceContract = await localKoinos.deployContract(nameserviceAcct.wif, '../name-service/build/release/contract.wasm', nameserviceAbi, { mode: 'manual' });

  // deploy usd oracle
  // @ts-ignore abi is compatible
  usdOracleContract = await localKoinos.deployContract(usdOracleAcct.wif, '../usd-oracle/build/release/contract.wasm', usdOracleAbi, { mode: 'manual' });

  // deploy a dummy collection
  // @ts-ignore abi is compatible
  collectionContract = await localKoinos.deployContract(collectionAcct.wif, '../test-collection/build/release/contract.wasm', collectionAbi, { mode: 'manual' });

  // deploy referral contract
  // @ts-ignore abi is compatible
  referralContract = await localKoinos.deployContract(referralAcct.wif, '../referral/build/release/contract.wasm', referralAbi, { mode: 'manual' });

  await localKoinos.startBlockProduction();
});

afterAll(async () => {
  // stop local-koinos node
  await localKoinos.stopNode();
});

async function generateReferralCode(
  signer: Signer,
  chain_id: string,
  issuance_date: string,
  expiration_date: string,
  allowed_redemption_account = '',
  allowed_redemption_contract = '',
  data = ''
) {
  const metadata = {
    chain_id,
    referral_contract_id: referralAcct.address,
    issuer: signer.address,
    issuance_date,
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
  it('allow minting a free KAP name with a referral code', async () => {
    // set koin domain contract metadata
    let res = await koinDomainContract.functions.set_metadata({
      metadata: {
        nameservice_address: nameserviceAcct.address,
        oracle_address: usdOracleAcct.address,
        press_badge_address: collectionAcct.address,
        is_launched: true,
        beneficiary: koinDomainAcct.address,
        referral_contract_address: referralAcct.address,
        // 1 day
        referrals_refresh_period: `${3600 * 1000 * 24}`,
        max_referrals_per_period: '3',
        premium_account_referral_discount_percent: 50
      }
    });

    await res.transaction?.wait();

    res = await koinDomainContract.functions.get_metadata({});

    expect(res?.result?.referral_contract_address).toEqual(referralAcct.address);
    expect(res?.result?.referrals_refresh_period).toEqual(`${3600 * 1000 * 24}`);
    expect(res?.result?.max_referrals_per_period).toEqual('3');
    expect(res?.result?.premium_account_referral_discount_percent).toEqual(50);

    // mint the koin name to koin domain account
    res = await nameserviceContract.functions.mint({
      name: 'koin',
      owner: koinDomainAcct.address
    });

    await res.transaction?.wait();

    // set the koin price in oracle to $1
    res = await usdOracleContract.functions.set_latest_price({
      token_address: koin.address,
      price: '100000000' // $1
    });

    await res.transaction?.wait();

    // buy a premium name
    res = await nameserviceContract.functions.mint({
      name: 'premium.koin',
      owner: user1.address,
      duration_increments: 1, // 1 year
      payment_from: user1.address,
    }, {
      beforeSend: async (tx) => {
        await user1.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();

    // generate referral code
    const chain_id = await referralContract.provider.getChainId();

    let referral_code = await generateReferralCode(
      user1.signer,
      chain_id,
      (new Date().getTime() - 10000).toString(),
      (new Date().getTime() + 10000).toString(),
      '',
      koinDomainAcct.address,
      Buffer.from('premium.koin').toString('base64url')
    );

    // buy a free name
    res = await nameserviceContract.functions.mint({
      name: 'thisisafreename.koin',
      owner: user2.address,
      data: utils.encodeBase64url(
        await referralContract.serializer.serialize(referral_code, 'referral.referral_code')
      )
    }, {
      beforeSend: async (tx) => {
        await user2.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'thisisafreename.koin'
    });

    expect(res?.result?.domain).toEqual('koin');
    expect(res?.result?.name).toEqual('thisisafreename');
    expect(res?.result?.owner).toEqual(user2.address);

    referral_code = await generateReferralCode(
      user1.signer,
      chain_id,
      (new Date().getTime() - 10000).toString(),
      (new Date().getTime() + 10000).toString(),
      '',
      koinDomainAcct.address,
      Buffer.from('premium.koin').toString('base64url')
    );

    // buy a premium name
    res = await nameserviceContract.functions.mint({
      name: 'premium2.koin',
      owner: user3.address,
      duration_increments: 1, // 1 year
      payment_from: user3.address,
      data: utils.encodeBase64url(
        await referralContract.serializer.serialize(referral_code, 'referral.referral_code')
      )
    }, {
      beforeSend: async (tx) => {
        await user3.signer.signTransaction(tx);
      }
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: 'premium2.koin'
    });

    expect(res?.result?.domain).toEqual('koin');
    expect(res?.result?.name).toEqual('premium2');
    expect(res?.result?.owner).toEqual(user3.address);

    res = await koinDomainContract.functions.get_purchases({});

    expect(res.result).toEqual({
      purchases: expect.arrayContaining([
        expect.objectContaining({
          buyer: user1.address,
          name: 'premium',
          usd_amount: '1000000000',
        }),
        expect.objectContaining({
          buyer: user3.address,
          name: 'premium2',
          // should be 50% of $10, $5
          usd_amount: '500000000',
        })
      ])
    });
  });

});
