import { Contract, Signer, Provider, utils } from 'koilib';
import * as abi from '../contracts/referral/abi/referral-abi.json';
require('dotenv').config();

// @ts-ignore koilib_types is needed when using koilib
abi.koilib_types = abi.types;

const {
  REFERRAL_CONTRACT_ADDRESS,
  REFERRAL_CODE_ISSUER_PRIVATE_KEY,
  RPC_URL,
  KOIN_DOMAIN_ADDRESS
} = process.env;

const signer = Signer.fromWif(REFERRAL_CODE_ISSUER_PRIVATE_KEY);
const provider = new Provider(RPC_URL);

const referralContract = new Contract({
  id: REFERRAL_CONTRACT_ADDRESS,
  // @ts-ignore abi is compatible
  abi,
  provider,
  signer
});

async function generateReferralCode(
  expiration_date = '0',
  allowed_redemption_account = '',
  allowed_redemption_contract = '',
  data = ''
) {
  const metadata = {
    chain_id: await provider.getChainId(),
    referral_contract_id: referralContract.getId(),
    issuer: signer.address,
    issuance_date: new Date().getTime().toString(),
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

(async () => {
  // referral code that does not expire
  let referralCode = await generateReferralCode();
  console.log(referralCode);
  console.log(utils.encodeBase64url(await referralContract.serializer.serialize(referralCode, 'referral.referral_code')));

  // referral code that expires
  referralCode = await generateReferralCode(
    // expires in 1 day
    (new Date().getTime() + 3600 * 1000 * 24).toString()
  );
  console.log(referralCode);
  console.log(utils.encodeBase64url(await referralContract.serializer.serialize(referralCode, 'referral.referral_code')));

  // referral code that expires and that can only be redeemed through the Koin Domain contract
  referralCode = await generateReferralCode(
    // expires in 1 day
    (new Date().getTime() + 3600 * 1000 * 24).toString(),
    '',
    KOIN_DOMAIN_ADDRESS
  );
  console.log(referralCode);
  console.log(utils.encodeBase64url(await referralContract.serializer.serialize(referralCode, 'referral.referral_code')));

  // referral code that is compatible with referrals used in the Koin domain contract
  referralCode = await generateReferralCode(
    // expires in 1 day
    (new Date().getTime() + 3600 * 1000 * 24).toString(),
    '',
    // optional Koin Domain address
    KOIN_DOMAIN_ADDRESS,
    // name of the premium account owned by signer that will be checked for referral allowances
    Buffer.from('premium.koin').toString('base64url')
  );
  console.log(referralCode);
  console.log(utils.encodeBase64url(await referralContract.serializer.serialize(referralCode, 'referral.referral_code')));
})();