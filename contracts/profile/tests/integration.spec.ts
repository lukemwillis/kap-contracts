/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Contract, LocalKoinos, Serializer, Token } from "@roamin/local-koinos";

import * as profileAbi from '../abi/profile-abi.json';
import * as nameserviceAbi from '../../name-service/abi/collections-abi.json';
import * as collectionAbi from '../../test-collection/abi/testcollection-abi.json';

// @ts-ignore koilib_types is needed when using koilib
profileAbi.koilib_types = profileAbi.types;

// @ts-ignore koilib_types is needed when using koilib
nameserviceAbi.koilib_types = nameserviceAbi.types;

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
  collectionAcct,
  profileAcct,
  user1,
  user2,
  user3,
  user4,
] = localKoinos.getAccounts();

let nameserviceContract: Contract;
let collectionContract: Contract;
let profileContract: Contract;

beforeAll(async () => {
  // start local-koinos node
  await localKoinos.startNode();

  await localKoinos.deployKoinContract({ mode: "manual" });
  await localKoinos.mintKoinDefaultAccounts({ mode: "manual" });
  await localKoinos.deployNameServiceContract({ mode: "manual" });
  await localKoinos.setNameServiceRecord("koin", koin.address, {
    mode: "manual",
  });

  // deploy profile
  profileContract = await localKoinos.deployContract(
    profileAcct.wif,
    "./build/release/contract.wasm",
    // @ts-ignore abi is compatible
    profileAbi,
    { mode: "manual" }
  );

  // deploy nameservice
  nameserviceContract = await localKoinos.deployContract(
    nameserviceAcct.wif,
    "../name-service/build/release/contract.wasm",
    // @ts-ignore abi is compatible
    nameserviceAbi,
    { mode: "manual" }
  );

  // deploy test collection
  collectionContract = await localKoinos.deployContract(
    collectionAcct.wif,
    "../test-collection/build/release/contract.wasm",
    // @ts-ignore abi is compatible
    collectionAbi,
    { mode: "manual" }
  );

  await localKoinos.startBlockProduction();
});

afterAll(async () => {
  // stop local-koinos node
  await localKoinos.stopNode();
});

function encodeHex(str: string) {
  return `0x${Buffer.from(str, "utf-8").toString("hex")}`;
}

describe("profile", () => {
  it("should set the contract metadata", async () => {
    let res = await profileContract.functions.set_metadata({
      metadata: {
        nameservice_address: nameserviceContract.getId(),
      },
    });

    await res.transaction?.wait();

    res = await profileContract.functions.get_metadata({});

    expect(res.result.nameservice_address).toEqual(nameserviceContract.getId());
  });

  it("should set a profile", async () => {
    // set a simple profile with no name and avatar
    let res = await profileContract.functions.update_profile(
      {
        address: user1.address,
        profile: {
          bio: "I am user 1",
          theme: "111",
          links: [
            { key: "hello", value: "world" },
            { key: "hello2", value: "world2" },
          ],
        },
      },
      {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await profileContract.functions.get_profile({
      address: user1.address,
    });

    expect(res.result).toEqual({
      avatar_contract_id: "",
      avatar_token_id: "0x",
      bio: "I am user 1",
      theme: "111",
      links: [
        { key: "hello", value: "world" },
        { key: "hello2", value: "world2" },
      ],
    });

    res = await profileContract.functions.update_profile(
      {
        address: user1.address,
        profile: {
          bio: "I am still user 1",
          theme: "fff",
          links: [
            { key: "hello", value: "world" },
            { key: "hello2", value: "world2" },
            { key: "hello3", value: "world3" },
          ],
        },
      },
      {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await profileContract.functions.get_profile({
      address: user1.address,
    });

    expect(res.result).toEqual({
      avatar_contract_id: "",
      avatar_token_id: "0x",
      bio: "I am still user 1",
      theme: "fff",
      links: [
        { key: "hello", value: "world" },
        { key: "hello2", value: "world2" },
        { key: "hello3", value: "world3" },
      ],
    });

    // mint some names
    res = await nameserviceContract.functions.mint({
      name: "user1",
      owner: user1.address,
    });

    await res.transaction?.wait();

    res = await nameserviceContract.functions.mint({
      name: "user2",
      owner: user2.address,
    });

    await res.transaction?.wait();

    // mint some NFTs
    res = await collectionContract.functions.mint({
      owner: user1.address,
      token_id: "0x01",
    });

    await res.transaction?.wait();

    res = await collectionContract.functions.mint({
      owner: user2.address,
      token_id: "0x02",
    });

    await res.transaction?.wait();

    // set a profile with name and avatar
    res = await profileContract.functions.update_profile(
      {
        address: user2.address,
        profile: {
          avatar_contract_id: collectionContract.getId(),
          avatar_token_id: "0x02",
          name: "user2",
          bio: "I am user 2",
          theme: "CCCccc",
          links: [
            { key: "hello", value: "world" },
            { key: "hello2", value: "world2" },
          ],
        },
      },
      {
        beforeSend: async (tx) => {
          await user2.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await profileContract.functions.get_profile({
      address: user2.address,
    });

    expect(res.result).toEqual({
      avatar_contract_id: collectionContract.getId(),
      avatar_token_id: "0x02",
      name: "user2",
      bio: "I am user 2",
      theme: "CCCccc",
      links: [
        { key: "hello", value: "world" },
        { key: "hello2", value: "world2" },
      ],
    });

    res = await profileContract.functions.update_profile(
      {
        address: user1.address,
        profile: {
          avatar_contract_id: collectionContract.getId(),
          avatar_token_id: "0x01",
          name: "user1",
          bio: "I am user one",
          theme: "000",
          links: [],
        },
      },
      {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await profileContract.functions.get_profile({
      address: user1.address,
    });

    expect(res.result).toEqual({
      avatar_contract_id: collectionContract.getId(),
      avatar_token_id: "0x01",
      name: "user1",
      bio: "I am user one",
      theme: "000",
      links: [],
    });
  });

  it("should not set a profile", async () => {
    expect.assertions(4);

    try {
      await profileContract.functions.update_profile(
        {
          profile: {
            avatar_contract_id: collectionContract.getId(),
            avatar_token_id: "0x01",
            name: "user1",
            bio: "I am user one",
            theme: "000",
            links: [],
          },
        },
        {
          beforeSend: async (tx) => {
            await user1.signer.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        'missing "address" argument'
      );
    }

    try {
      await profileContract.functions.update_profile(
        {
          address: user1.address,
        },
        {
          beforeSend: async (tx) => {
            await user1.signer.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        'missing "profile" argument'
      );
    }

    try {
      await profileContract.functions.update_profile(
        {
          address: user1.address,
          profile: {
            avatar_contract_id: collectionContract.getId(),
            avatar_token_id: "0x01",
            name: "user1",
            bio: "I am user one",
            theme: "0000",
            links: [],
          },
        },
        {
          beforeSend: async (tx) => {
            await user1.signer.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        '"theme" argument must be composed of 3 or 6 characters.'
      );
    }

    try {
      await profileContract.functions.update_profile(
        {
          address: user1.address,
          profile: {
            avatar_contract_id: collectionContract.getId(),
            avatar_token_id: "0x01",
            name: "user1",
            bio: "I am user one",
            theme: "00J",
            links: [],
          },
        },
        {
          beforeSend: async (tx) => {
            await user1.signer.signTransaction(tx);
          },
        }
      );
    } catch (error) {
      expect(JSON.parse(error.message).error).toStrictEqual(
        '"J" is not a valid hex character'
      );
    }
  });

  it("should not get avatar or name", async () => {
    // transfer NFT 0x01 to user2
    let res = await collectionContract.functions.transfer(
      {
        from: user1.address,
        to: user2.address,
        token_id: "0x01",
      },
      {
        beforeSend: async (tx) => {
          await user1.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await profileContract.functions.get_profile({
      address: user1.address,
    });

    // avater info should be blank
    expect(res.result).toEqual({
      avatar_contract_id: "",
      avatar_token_id: "0x",
      name: "user1",
      bio: "I am user one",
      theme: "000",
      links: [],
    });

    // transfer name user2 to user1
    res = await nameserviceContract.functions.transfer(
      {
        from: user2.address,
        to: user1.address,
        token_id: encodeHex("user2"),
      },
      {
        beforeSend: async (tx) => {
          await user2.signer.signTransaction(tx);
        },
      }
    );

    await res.transaction?.wait();

    res = await profileContract.functions.get_profile({
      address: user2.address,
    });

    // name info should be blank
    expect(res.result).toEqual({
      avatar_contract_id: collectionContract.getId(),
      avatar_token_id: "0x02",
      bio: "I am user 2",
      theme: "CCCccc",
      links: [
        { key: "hello", value: "world" },
        { key: "hello2", value: "world2" },
      ],
    });
  });
});
