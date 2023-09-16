import { createHash, randomUUID } from "crypto";
import { Contract, Provider, Signer } from "koilib";
import { config } from "dotenv";
config();
import koinDomainAbi from "../contracts/koin-domain/abi/koindomain-abi.json";

const result = {
  codes: [],
};

for (let i = 0; i < 10000; i++) {
  const code = randomUUID();
  const hash = createHash("sha256").update(code).digest();
  result.codes.push({
    code,
    hash: `0x1220${hash.toString("hex")}`,
  });
}

console.log(result);

const WIF = process.env.WIF; // Read WIF from environment variable
const CONTRACT_ID = process.env.CONTRACT_ID;
const JSON_RPC = process.env.JSON_RPC;

// Modify the contract ABI to match the expected format
const abi = {
  ...koinDomainAbi,
  koilib_types: koinDomainAbi.types,
};

// Initialize contract
const signer = Signer.fromWif(WIF);
const provider = new Provider(JSON_RPC);
signer.provider = provider;
const contract = new Contract({
  id: CONTRACT_ID,
  provider,
  signer,
  abi,
});

let current = 0;
async function processBatch() {
  const operations = [];
  for (let i = 0; i < 100 && current < result.codes.length; i++, current++) {
    const { code, hash } = result.codes[current];
    console.log(`Adding promo code ${code} with hash ${hash}`);
    const { operation } = await contract.functions.add_promo_code(
      {
        hashed_promo_code: hash,
      },
      {
        onlyOperation: true,
      }
    );
    operations.push(operation);
  }
  const tx = await signer.prepareTransaction({
    header: {
      rc_limit: "10000000000",
    },
    operations,
  });
  const { transaction } = await signer.sendTransaction(tx);
  console.log(`batch sent with tx id ${transaction.id}`);
  await transaction.wait().then((receipt) => {
    console.log(`batch included in block ${receipt.blockId}`);
    processBatch();
  });
}

processBatch();
