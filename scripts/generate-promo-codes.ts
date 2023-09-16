import { createHash, randomUUID } from "crypto";
import fs from "fs";
import { Contract, Provider, Signer } from "koilib";
import { config } from "dotenv";
config();
import koinDomainAbi from "../contracts/koin-domain/abi/koindomain-abi.json";

const codes = []; 

for (let i = 0; i < 10000; i++) {
  const guid = randomUUID(); 
  const hash = createHash("sha256").update(guid).digest();
  codes.push({
    index: i,
    guid, 
    hashed_promo_code: `0x1220${hash.toString("hex")}`,
  });
}

// Write the promo codes to a JSON file (uuids.json)
fs.writeFileSync("uuids.json", JSON.stringify(codes, null, 2), "utf8");
console.log("Promo codes saved to uuids.json");

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
  for (let i = 0; i < 100 && current < codes.length; i++, current++) {
    const { guid, hashed_promo_code } = codes[current]; 
    console.log(`Adding promo code ${guid} with hash ${hashed_promo_code}`);
    const { operation } = await contract.functions.add_promo_code(
      {
        hashed_promo_code,
      },
      {
        onlyOperation: true,
      }
    );
    operations.push(operation);
  }
  const tx = await signer.prepareTransaction({
    header: {
      rc_limit: "500000000",
    },
    operations,
  });
  const { transaction } = await signer.sendTransaction(tx);
  console.log(`batch sent with tx id ${transaction.id}`);
  await transaction.wait("byTransactionId", 90000).then((receipt) => {
    console.log(`batch included in block ${receipt.blockId}`);
    processBatch();
  });
}

processBatch();
