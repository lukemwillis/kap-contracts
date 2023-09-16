import { createHash, randomUUID } from "crypto";
import { Contract, Provider, Signer } from "koilib";
import { config } from "dotenv";
config();
import koinDomainAbi from "../contracts/koin-domain/abi/koindomain-abi.json";

const result = {
  codes: [],
};

for (let i = 0; i < 100; i++) {
  const code = randomUUID();
  const hash = createHash("sha256").update(code).digest();
  result.codes.push({
    code,
    hash: `0x1220${hash.toString("hex")}`,
  });
}

console.log(result);

// const { config } = require("dotenv");
// config(); // Load environment variables from .env file

// const koinDomainAbi = require("./koindomain-abi.json");
// const promoCodes = require("./promo-codes.json");

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
  const txs = [];
  for (let i = 0; i < 1 && current < result.codes.length; i++, current++) {
    const { code, hash } = result.codes[current];
    txs.push(contract.functions.add_promo_code(
      {
        hashed_promo_code: hash,
      },
      {
      //   payer: process.env.CRON_PAYER,
        rcLimit: "50000000",
      }
    ).then(({ transaction }) => {
      console.log(`${transaction.id} sent for ${code}`);
      return transaction.wait("byTransactionId", 90000).then((res) => { console.log(`${transaction.id} included in ${res.blockId}`); });
    }));
  }
  await Promise.all(txs).then(() => {
    console.log("finished batch");
    processBatch();
  });
}

processBatch();
