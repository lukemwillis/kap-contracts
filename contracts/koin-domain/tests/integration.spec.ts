/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Contract, LocalKoinos, Signer, Token } from "@roamin/local-koinos";

// ABIs
import * as koindomainAbi from "../abi/koindomain-abi.json";
import * as nameserviceAbi from "../../name-service/abi/collections-abi.json";
import * as usdOracleAbi from "../../usd-oracle/abi/usdoracle-abi.json";
import * as collectionAbi from "../../test-collection/abi/testcollection-abi.json";

// @ts-ignore koilib_types is needed when using koilib
koindomainAbi.koilib_types = koindomainAbi.types;
// @ts-ignore koilib_types is needed when using koilib
nameserviceAbi.koilib_types = nameserviceAbi.types;
// @ts-ignore koilib_types is needed when using koilib
usdOracleAbi.koilib_types = usdOracleAbi.types;
// @ts-ignore koilib_types is needed when using koilib
collectionAbi.koilib_types = collectionAbi.types;

jest.setTimeout(600000);

let localKoinos = new LocalKoinos();

if (process.env.ENV === "LOCAL") {
  localKoinos = new LocalKoinos({
    rpc: "http://host.docker.internal:8080",
    amqp: "amqp://host.docker.internal:5672",
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
] = localKoinos.getAccounts();

let koinDomainContract: Contract;
let nameserviceContract: Contract;
let usdOracleContract: Contract;
let collectionContract: Contract;

beforeAll(async () => {
  // start local-koinos node
  await localKoinos.startNode();

  await localKoinos.deployKoinContract({ mode: "manual" });
  await localKoinos.mintKoinDefaultAccounts({ mode: "manual" });
  await localKoinos.deployNameServiceContract({ mode: "manual" });
  await localKoinos.setNameServiceRecord("koin", koin.address, {
    mode: "manual",
  });

  // deploy koin domain
  // @ts-ignore abi is compatible
  koinDomainContract = await localKoinos.deployContract(koinDomainAcct.wif, "./build/release/contract.wasm", koindomainAbi, { mode: "manual" });

  // deploy nameservice
  // @ts-ignore abi is compatible
  nameserviceContract = await localKoinos.deployContract(nameserviceAcct.wif, "../name-service/build/release/contract.wasm", nameserviceAbi, { mode: "manual" });

  // deploy usd oracle
  // @ts-ignore abi is compatible
  usdOracleContract = await localKoinos.deployContract(usdOracleAcct.wif, "../usd-oracle/build/release/contract.wasm", usdOracleAbi, { mode: "manual" });

  // deploy a dummy collection
  // @ts-ignore abi is compatible
  collectionContract = await localKoinos.deployContract(collectionAcct.wif, "../test-collection/build/release/contract.wasm", collectionAbi, { mode: "manual" });

  await localKoinos.startBlockProduction();
});

afterAll(async () => {
  // stop local-koinos node
  await localKoinos.stopNode();
});

describe("mint", () => {
  it("should mint a .koin name", async () => {
    // set koin domain contract metadata
    let res = await koinDomainContract.functions.set_metadata({
      metadata: {
        nameservice_address: nameserviceAcct.address,
        oracle_address: usdOracleAcct.address,
        owner: user1.address,
        press_badge_address: collectionAcct.address,
        is_launched: true,
        beneficiary: koinDomainAcct.address
      }
    });

    await res.transaction?.wait();

    res = await koinDomainContract.functions.get_metadata({});

    expect(res?.result?.nameservice_address).toEqual(nameserviceAcct.address);
    expect(res?.result?.oracle_address).toEqual(usdOracleAcct.address);

    // mint the koin name to koin domain account
    res = await nameserviceContract.functions.mint({
      name: "koin",
      owner: koinDomainAcct.address,
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: "koin",
    });

    expect(res?.result?.domain).toEqual(undefined);
    expect(res.result).toStrictEqual({
      name: "koin",
      owner: koinDomainAcct.address,
      expiration: "0",
      grace_period_end: "0",
      sub_names_count: "0",
      locked_kap_tokens: "0",
    });

    // set the koin price in oracle to $1
    res = await usdOracleContract.functions.set_latest_price({
      token_address: koin.address,
      price: "100000000", // $1
    });

    await res.transaction?.wait();

    res = await usdOracleContract.functions.get_latest_price({
      token_address: koin.address,
    });

    expect(res?.result?.price).toEqual("100000000");

    // buy a 10 char name for 1 year (should cost $10x1=$10 => 10 Koin)
    let user1Bal = await localKoinos.koin.balanceOf(user1.address);
    expect(user1Bal).toEqual("5000000000000");

    res = await nameserviceContract.functions.mint(
      {
        name: "1234567891.koin",
        owner: user1.address,
        duration_increments: 1, // 1 year
        payment_from: user1.address,
      },
      {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: "1234567891.koin",
    });

    expect(res?.result?.domain).toEqual("koin");
    expect(res?.result?.name).toEqual("1234567891");
    expect(res?.result?.owner).toEqual(user1.address);

    user1Bal = await localKoinos.koin.balanceOf(user1.address);
    expect(user1Bal).toEqual("4999000000000");

    let koinDomainBal = await localKoinos.koin.balanceOf(
      koinDomainAcct.address
    );
    expect(koinDomainBal).toEqual("5001000000000");

    res = await koinDomainContract.functions.get_purchases({});

    expect(res.result).toEqual({
      purchases: expect.arrayContaining([
        expect.objectContaining({
          buyer: user1.address,
          name: "1234567891",
          usd_amount: "1000000000",
        }),
      ]),
    });

    // buy a 5 char name for 2 years (should cost $100x2=$200 => 200 Koin)
    res = await nameserviceContract.functions.mint(
      {
        name: "12345.koin",
        owner: user2.address,
        duration_increments: 2, // 2 years
        payment_from: user2.address,
      },
      {
        beforeSend: async (tx) => {
          await user2.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: "12345.koin",
    });

    expect(res?.result?.domain).toEqual("koin");
    expect(res?.result?.name).toEqual("12345");
    expect(res?.result?.owner).toEqual(user2.address);

    let user2Bal = await localKoinos.koin.balanceOf(user2.address);
    expect(user2Bal).toEqual("4980000000000");

    koinDomainBal = await localKoinos.koin.balanceOf(koinDomainAcct.address);
    expect(koinDomainBal).toEqual("5021000000000");

    res = await koinDomainContract.functions.get_purchases({});

    expect(res.result).toEqual({
      purchases: expect.arrayContaining([
        expect.objectContaining({
          buyer: user1.address,
          name: "1234567891",
          usd_amount: "1000000000",
        }),
        expect.objectContaining({
          buyer: user2.address,
          name: "12345",
          usd_amount: "20000000000",
        }),
      ]),
    });

    // buy a 2 char name for 3 years (should cost $500x3=$1500 => 1500 Koin)
    res = await nameserviceContract.functions.mint(
      {
        name: "12.koin",
        owner: user3.address,
        duration_increments: 3, // 2 years
        payment_from: user3.address,
      },
      {
        beforeSend: async (tx) => {
          await user3.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: "12.koin",
    });

    expect(res?.result?.domain).toEqual("koin");
    expect(res?.result?.name).toEqual("12");
    expect(res?.result?.owner).toEqual(user3.address);

    let user3Bal = await localKoinos.koin.balanceOf(user3.address);
    expect(user3Bal).toEqual("4850000000000");

    koinDomainBal = await localKoinos.koin.balanceOf(koinDomainAcct.address);
    expect(koinDomainBal).toEqual("5171000000000");

    res = await koinDomainContract.functions.get_purchases({});

    expect(res.result).toEqual({
      purchases: expect.arrayContaining([
        expect.objectContaining({
          buyer: user1.address,
          name: "1234567891",
          usd_amount: "1000000000",
        }),
        expect.objectContaining({
          buyer: user2.address,
          name: "12345",
          usd_amount: "20000000000",
        }),
        expect.objectContaining({
          buyer: user3.address,
          name: "12",
          usd_amount: "150000000000",
        }),
      ]),
    });

    // buy a 1 char name for 10 years (should cost $1000x10=$10000 => 1000 Koin)
    res = await nameserviceContract.functions.mint(
      {
        name: "1.koin",
        owner: user4.address,
        duration_increments: 10, // 2 years
        payment_from: user4.address,
      },
      {
        beforeSend: async (tx) => {
          await user4.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: "1.koin",
    });

    expect(res?.result?.domain).toEqual("koin");
    expect(res?.result?.name).toEqual("1");
    expect(res?.result?.owner).toEqual(user4.address);

    let user4Bal = await localKoinos.koin.balanceOf(user4.address);
    expect(user4Bal).toEqual("4000000000000");

    koinDomainBal = await localKoinos.koin.balanceOf(koinDomainAcct.address);
    expect(koinDomainBal).toEqual("6171000000000");

    res = await koinDomainContract.functions.get_purchases({});

    expect(res.result).toEqual({
      purchases: expect.arrayContaining([
        expect.objectContaining({
          buyer: user1.address,
          name: "1234567891",
          usd_amount: "1000000000",
        }),
        expect.objectContaining({
          buyer: user2.address,
          name: "12345",
          usd_amount: "20000000000",
        }),
        expect.objectContaining({
          buyer: user3.address,
          name: "12",
          usd_amount: "150000000000",
        }),
        expect.objectContaining({
          buyer: user4.address,
          name: "1",
          usd_amount: "1000000000000",
        }),
      ]),
    });

    // set the koin price in oracle to $1000
    res = await usdOracleContract.functions.set_latest_price({
      token_address: koin.address,
      price: "100000000000", // $1000
    });

    await res.transaction?.wait();

    // buy a 10 char name for 1 year (should cost $10x1=$10 => 10 Koin)
    res = await nameserviceContract.functions.mint(
      {
        name: "1234567892.koin",
        owner: user1.address,
        duration_increments: 1, // 1 year
        payment_from: user1.address,
      },
      {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: "1234567892.koin",
    });

    expect(res?.result?.domain).toEqual("koin");
    expect(res?.result?.name).toEqual("1234567892");
    expect(res?.result?.owner).toEqual(user1.address);

    user1Bal = await localKoinos.koin.balanceOf(user1.address);
    expect(user1Bal).toEqual("4998999000000");

    koinDomainBal = await localKoinos.koin.balanceOf(koinDomainAcct.address);
    expect(koinDomainBal).toEqual("6171001000000");

    res = await koinDomainContract.functions.get_purchases({});

    expect(res.result).toEqual({
      purchases: expect.arrayContaining([
        expect.objectContaining({
          buyer: user1.address,
          name: "1234567891",
          usd_amount: "1000000000",
        }),
        expect.objectContaining({
          buyer: user2.address,
          name: "12345",
          usd_amount: "20000000000",
        }),
        expect.objectContaining({
          buyer: user3.address,
          name: "12",
          usd_amount: "150000000000",
        }),
        expect.objectContaining({
          buyer: user4.address,
          name: "1",
          usd_amount: "1000000000000",
        }),
        expect.objectContaining({
          buyer: user1.address,
          name: "1234567892",
          usd_amount: "1000000000",
        }),
      ]),
    });
  });

  it("mint and renew endpoints should only be allowed for the nameservice contract", async () => {
    expect.assertions(2);
    try {
      await koinDomainContract.functions.authorize_mint({});
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        "only nameservice contract can perform this action"
      );
    }

    try {
      await koinDomainContract.functions.authorize_renewal({});
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        "only nameservice contract can perform this action"
      );
    }
  });

  it("should not mint a .koin name", async () => {
    expect.assertions(4);

    try {
      await nameserviceContract.functions.mint(
        {
          name: "12345678910.koin",
          owner: user1.address,
          duration_increments: 1, // 1 year
          payment_from: user1.address,
        },
        {
          beforeSend: async (tx) => {
            await user1.signer.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        "free accounts are not available yet"
      );
    }

    try {
      await nameserviceContract.functions.mint(
        {
          name: "hello.koin",
          owner: user1.address,
          duration_increments: 1, // 1 year
        },
        {
          beforeSend: async (tx) => {
            await user1.signer.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        '"payment_from" argument is missing'
      );
    }

    try {
      await nameserviceContract.functions.mint(
        {
          name: "hello.koin",
          owner: user1.address,
          duration_increments: 11,
          payment_from: user1.address,
        },
        {
          beforeSend: async (tx) => {
            await user1.signer.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        "you can only buy a premium account for a period of 1 to 10 years"
      );
    }

    const noKoiner = Signer.fromSeed("no koiner");
    try {
      await nameserviceContract.functions.mint(
        {
          name: "hello.koin",
          owner: noKoiner.address,
          duration_increments: 10,
          payment_from: noKoiner.address,
        },
        {
          beforeSend: async (tx) => {
            await noKoiner.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        "could not transfer Koin tokens"
      );
    }
  });

  it("should renew a .koin name", async () => {
    // set the koin price in oracle to $1
    let res = await usdOracleContract.functions.set_latest_price({
      token_address: koin.address,
      price: "100000000", // $1
    });

    await res.transaction?.wait();

    // get a koin name info
    res = await nameserviceContract.functions.get_name({
      name: "1234567891.koin",
    });

    const currentExp = Number(res.result.expiration);

    res = await nameserviceContract.functions.renew(
      {
        name: "1234567891.koin",
        duration_increments: 2, // 2 years
        payment_from: user1.address,
      },
      {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await nameserviceContract.functions.get_name({
      name: "1234567891.koin",
    });

    const MILLISECONDS_PER_DAY = 86_400_000;
    const MILLISECONDS_PER_YEAR = MILLISECONDS_PER_DAY * 365;

    const newExp = Number(res.result.expiration);
    const newGracePeriod = Number(res.result.grace_period_end);

    // newExp should be currentExp + 1 year
    expect(newExp - currentExp).toEqual(MILLISECONDS_PER_YEAR * 2);
    // newGracePeriod should be newExp + 60 days
    expect(newGracePeriod - newExp).toEqual(MILLISECONDS_PER_DAY * 60);

    const user1Bal = await localKoinos.koin.balanceOf(user1.address);
    expect(user1Bal).toEqual("4996999000000");

    const koinDomainBal = await localKoinos.koin.balanceOf(
      koinDomainAcct.address
    );
    expect(koinDomainBal).toEqual("6173001000000");
  });

  it("should not renew a .koin name", async () => {
    expect.assertions(4);

    try {
      await nameserviceContract.functions.renew(
        {
          name: "1234567891.koin",
          owner: user1.address,
          duration_increments: 10, // 10 years
        },
        {
          beforeSend: async (tx) => {
            await user1.signer.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        '"payment_from" argument is missing'
      );
    }

    try {
      await nameserviceContract.functions.renew(
        {
          name: "1234567891.koin",
          owner: user1.address,
          duration_increments: 11, // 11 year
          payment_from: user1.address,
        },
        {
          beforeSend: async (tx) => {
            await user1.signer.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        "you can only renew a premium account for a period of 1 to 10 years"
      );
    }

    try {
      await nameserviceContract.functions.renew(
        {
          name: "1234567891.koin",
          owner: user1.address,
          duration_increments: 10, // 10 years
          payment_from: user1.address,
        },
        {
          beforeSend: async (tx) => {
            await user1.signer.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        "new expiration cannot exceed 10 years"
      );
    }

    const noKoiner = Signer.fromSeed("no koiner");
    try {
      await nameserviceContract.functions.renew(
        {
          name: "1234567891.koin",
          duration_increments: 1,
          payment_from: noKoiner.address,
        },
        {
          beforeSend: async (tx) => {
            await noKoiner.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        "could not transfer Koin tokens"
      );
    }
  });
});

describe("authorizations", () => {
  it("should update the contract authorizations", async () => {
    expect.assertions(2);

    // override authorizations
    let res = await koinDomainContract.deploy({
      authorizesCallContract: true,
      authorizesTransactionApplication: true,
      authorizesUploadContract: true,
    });

    await res.transaction?.wait();

    // TODO I think this fails so zero assertions
    // change contract owner
    res = await koinDomainContract.functions.set_metadata({
      metadata: {
        nameservice_address: nameserviceAcct.address,
        oracle_address: usdOracleAcct.address,
        owner: user1.address,
        press_badge_address: collectionAcct.address,
        is_launched: true,
        beneficiary: koinDomainAcct.address
      }},
      {
        beforeSend: async (tx) => {
          await koinDomainAcct.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    try {
      await koinDomainContract.deploy();
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        `account ${koinDomainAcct.address} has not authorized transaction`
      );
    }

    // change contract signer to new owner
    koinDomainContract.signer = user1.signer;

    // try to update contract
    res = await koinDomainContract.deploy();

    await res.transaction?.wait();
    expect(res.receipt).toBeDefined();
  });
});
