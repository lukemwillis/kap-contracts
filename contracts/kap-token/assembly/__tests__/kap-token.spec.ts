import { Base58, MockVM, token, authority, Arrays, Protobuf, chain, protocol, vhp } from "@koinos/sdk-as";
import { KapToken } from "../KapToken";

const CONTRACT_ID = Base58.decode("1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqe");

const MOCK_ACCT1 = Base58.decode("1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqG");
const MOCK_ACCT2 = Base58.decode("1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqK");

let headBlock = new protocol.block();

describe("kap-token", () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(CONTRACT_ID);
    MockVM.setCaller(new chain.caller_data(new Uint8Array(0), chain.privilege.user_mode));

    headBlock.header = new protocol.block_header();
    headBlock.header!.height = 10;

    MockVM.setBlock(headBlock);
  });

  it("should get the name", () => {
    const tkn = new KapToken(new Uint8Array(0));

    const args = new token.name_arguments();
    const res = tkn.name(args);

    expect(res.value).toBe("Koinos Account Protocol Token");
  });

  it("should get the symbol", () => {
    const tkn = new KapToken(new Uint8Array(0));

    const args = new token.symbol_arguments();
    const res = tkn.symbol(args);

    expect(res.value).toBe("KAP");
  });

  it("should get the decimals", () => {
    const tkn = new KapToken(new Uint8Array(0));

    const args = new token.decimals_arguments();
    const res = tkn.decimals(args);

    expect(res.value).toBe(8);
  });

  it("should/not burn tokens", () => {
    const tkn = new KapToken(new Uint8Array(0));

    let callerData = new chain.caller_data();
    callerData.caller = CONTRACT_ID;
    callerData.caller_privilege = chain.privilege.kernel_mode;
    MockVM.setCaller(callerData);

    // set contract_call authority for CONTRACT_ID to true so that we can mint tokens
    let auth = new MockVM.MockAuthority(authority.authorization_type.contract_call, CONTRACT_ID, true);
    MockVM.setAuthorities([auth]);

    // check total supply
    const totalSupplyArgs = new token.total_supply_arguments();
    let totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(0);

    // mint tokens
    const mintArgs = new token.mint_arguments(MOCK_ACCT1, 123);
    tkn.mint(mintArgs);

    totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(123);

    let balanceArgs = new token.balance_of_arguments(MOCK_ACCT1);
    let balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(123);

    auth = new MockVM.MockAuthority(authority.authorization_type.contract_call, MOCK_ACCT1, true);
    MockVM.setAuthorities([auth]);

    // burn tokens
    tkn.burn(new token.burn_arguments(MOCK_ACCT1, 10));

    // check events
    const events = MockVM.getEvents();
    expect(events.length).toBe(2);
    expect(events[0].name).toBe('kap.token.mint_event');
    expect(events[0].impacted.length).toBe(1);
    expect(Arrays.equal(events[0].impacted[0], MOCK_ACCT1)).toBe(true);
    expect(events[1].name).toBe('kap.token.burn_event');
    expect(events[1].impacted.length).toBe(1);
    expect(Arrays.equal(events[1].impacted[0], MOCK_ACCT1)).toBe(true);

    const burnEvent = Protobuf.decode<token.burn_event>(events[1].data, token.burn_event.decode);
    expect(Arrays.equal(burnEvent.from, MOCK_ACCT1)).toBe(true);
    expect(burnEvent.value).toBe(10);

    // check balance
    balanceArgs = new token.balance_of_arguments(MOCK_ACCT1);
    balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(113);

    // check total supply
    totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(113);

    // save the MockVM state because the burn is going to revert the transaction
    MockVM.commitTransaction();

    // does not burn tokens
    expect(() => {
      const tkn = new KapToken(new Uint8Array(0));
      const burnArgs = new token.burn_arguments(MOCK_ACCT1, 200);
      tkn.burn(burnArgs);
    }).toThrow();

    // check error message
    expect(MockVM.getErrorMessage()).toBe("account 'from' has insufficient balance");

    MockVM.setAuthorities([]);

    callerData.caller_privilege = chain.privilege.user_mode;
    MockVM.setCaller(callerData);

    // save the MockVM state because the burn is going to revert the transaction
    MockVM.commitTransaction();

    expect(() => {
      // try to burn tokens
      const tkn = new KapToken(new Uint8Array(0));
      const burnArgs = new token.burn_arguments(MOCK_ACCT1, 123);
      tkn.burn(burnArgs);
    }).toThrow();

    // check error message
    expect(MockVM.getErrorMessage()).toBe("from has not authorized burn");

    // check balance
    balanceArgs = new token.balance_of_arguments(MOCK_ACCT1);
    balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(113);

    // check total supply
    totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(113);
  });

  it("should mint tokens", () => {
    const tkn = new KapToken(new Uint8Array(0));

    // set kernel mode
    MockVM.setCaller(new chain.caller_data(new Uint8Array(0), chain.privilege.kernel_mode));

    // set contract_call authority for CONTRACT_ID to true so that we can mint tokens
    const auth = new MockVM.MockAuthority(authority.authorization_type.contract_call, CONTRACT_ID, true);
    MockVM.setAuthorities([auth]);

    // check total supply
    const totalSupplyArgs = new token.total_supply_arguments();
    let totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(0);

    // mint tokens
    const mintArgs = new token.mint_arguments(MOCK_ACCT1, 123);
    tkn.mint(mintArgs);

    // check events
    const events = MockVM.getEvents();
    expect(events.length).toBe(1);
    expect(events[0].name).toBe('kap.token.mint_event');
    expect(events[0].impacted.length).toBe(1);
    expect(Arrays.equal(events[0].impacted[0], MOCK_ACCT1)).toBe(true);

    const mintEvent = Protobuf.decode<token.mint_event>(events[0].data, token.mint_event.decode);
    expect(Arrays.equal(mintEvent.to, MOCK_ACCT1)).toBe(true);
    expect(mintEvent.value).toBe(123);

    // check balance
    const balanceArgs = new token.balance_of_arguments(MOCK_ACCT1);
    const balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(123);

    // check total supply
    totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(123);
  });

  it("should not mint tokens if not contract account", () => {
    const tkn = new KapToken(new Uint8Array(0));

    // set contract_call authority for MOCK_ACCT1 to true so that we cannot mint tokens
    const auth = new MockVM.MockAuthority(authority.authorization_type.contract_call, MOCK_ACCT1, true);
    MockVM.setAuthorities([auth]);

    // check total supply
    const totalSupplyArgs = new token.total_supply_arguments();
    let totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(0);

    // check balance
    const balanceArgs = new token.balance_of_arguments(MOCK_ACCT1);
    let balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(0);

    // save the MockVM state because the mint is going to revert the transaction
    MockVM.commitTransaction();

    expect(() => {
      // try to mint tokens
      const tkn = new KapToken(new Uint8Array(0));
      const mintArgs = new token.mint_arguments(MOCK_ACCT2, 123);
      tkn.mint(mintArgs);
    }).toThrow();

    // check balance
    balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(0);

    // check total supply
    totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(0);
  });

  it("should not mint tokens if new total supply overflows", () => {
    const tkn = new KapToken(new Uint8Array(0));

    // set kernel mode
    MockVM.setCaller(new chain.caller_data(new Uint8Array(0), chain.privilege.kernel_mode));

    // set contract_call authority for CONTRACT_ID to true so that we can mint tokens
    const auth = new MockVM.MockAuthority(authority.authorization_type.contract_call, CONTRACT_ID, true);
    MockVM.setAuthorities([auth]);

    let mintArgs = new token.mint_arguments(MOCK_ACCT2, 123);
    tkn.mint(mintArgs);

    // check total supply
    const totalSupplyArgs = new token.total_supply_arguments();
    let totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(123);

    // save the MockVM state because the mint is going to revert the transaction
    MockVM.commitTransaction();

    expect(() => {
      const tkn = new KapToken(new Uint8Array(0));
      const mintArgs = new token.mint_arguments(MOCK_ACCT2, u64.MAX_VALUE);
      tkn.mint(mintArgs);
    }).toThrow();

    // check total supply
    totalSupplyRes = tkn.total_supply(totalSupplyArgs);
    expect(totalSupplyRes.value).toBe(123);

    // check error message
    expect(MockVM.getErrorMessage()).toBe("mint would overflow supply");
  });

  it("should transfer tokens", () => {
    const tkn = new KapToken(new Uint8Array(0));

    // set kernel mode
    MockVM.setCaller(new chain.caller_data(new Uint8Array(0), chain.privilege.kernel_mode));

    // set contract_call authority for CONTRACT_ID to true so that we can mint tokens
    const authContractId = new MockVM.MockAuthority(authority.authorization_type.contract_call, CONTRACT_ID, true);

    // set contract_call authority for MOCK_ACCT1 to true so that we can transfer tokens
    const authMockAcct1 = new MockVM.MockAuthority(authority.authorization_type.contract_call, MOCK_ACCT1, true);
    MockVM.setAuthorities([authContractId, authMockAcct1]);

    // mint tokens
    const mintArgs = new token.mint_arguments(MOCK_ACCT1, 123);
    tkn.mint(mintArgs);

    // transfer tokens
    const transferArgs = new token.transfer_arguments(MOCK_ACCT1, MOCK_ACCT2, 10);
    tkn.transfer(transferArgs);

    // check balances
    let balanceArgs = new token.balance_of_arguments(MOCK_ACCT1);
    let balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(113);

    balanceArgs = new token.balance_of_arguments(MOCK_ACCT2);
    balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(10);

    // check events
    const events = MockVM.getEvents();
    // 2 events, 1st one is the mint event, the second one is the transfer event
    expect(events.length).toBe(2);
    expect(events[1].name).toBe('kap.token.transfer_event');
    expect(events[1].impacted.length).toBe(2);
    expect(Arrays.equal(events[1].impacted[0], MOCK_ACCT2)).toBe(true);
    expect(Arrays.equal(events[1].impacted[1], MOCK_ACCT1)).toBe(true);

    const transferEvent = Protobuf.decode<token.transfer_event>(events[1].data, token.transfer_event.decode);
    expect(Arrays.equal(transferEvent.from, MOCK_ACCT1)).toBe(true);
    expect(Arrays.equal(transferEvent.to, MOCK_ACCT2)).toBe(true);
    expect(transferEvent.value).toBe(10);
  });

  it("should not transfer tokens without the proper authorizations", () => {
    const tkn = new KapToken(new Uint8Array(0));

    // set kernel mode
    MockVM.setCaller(new chain.caller_data(new Uint8Array(0), chain.privilege.kernel_mode));

    // set contract_call authority for CONTRACT_ID to true so that we can mint tokens
    const authContractId = new MockVM.MockAuthority(authority.authorization_type.contract_call, CONTRACT_ID, true);
    // do not set authority for MOCK_ACCT1
    MockVM.setAuthorities([authContractId]);

    // mint tokens
    const mintArgs = new token.mint_arguments(MOCK_ACCT1, 123);
    tkn.mint(mintArgs);

    // save the MockVM state because the transfer is going to revert the transaction
    MockVM.commitTransaction();

    expect(() => {
      // try to transfer tokens without the proper authorizations for MOCK_ACCT1
      const tkn = new KapToken(new Uint8Array(0));
      const transferArgs = new token.transfer_arguments(MOCK_ACCT1, MOCK_ACCT2, 10);
      tkn.transfer(transferArgs);
    }).toThrow();

    // check balances
    let balanceArgs = new token.balance_of_arguments(MOCK_ACCT1);
    let balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(123);

    balanceArgs = new token.balance_of_arguments(MOCK_ACCT2);
    balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(0);
  });

  it("should not transfer tokens to self", () => {
    const tkn = new KapToken(new Uint8Array(0));

    // set kernel mode
    MockVM.setCaller(new chain.caller_data(new Uint8Array(0), chain.privilege.kernel_mode));

    // set contract_call authority for CONTRACT_ID to true so that we can mint tokens
    const authContractId = new MockVM.MockAuthority(authority.authorization_type.contract_call, CONTRACT_ID, true);

    // set contract_call authority for MOCK_ACCT1 to true so that we can transfer tokens
    const authMockAcct1 = new MockVM.MockAuthority(authority.authorization_type.contract_call, MOCK_ACCT1, true);
    MockVM.setAuthorities([authContractId, authMockAcct1]);

    // mint tokens
    const mintArgs = new token.mint_arguments(MOCK_ACCT1, 123);
    tkn.mint(mintArgs);

    // save the MockVM state because the transfer is going to revert the transaction
    MockVM.commitTransaction();

    // try to transfer tokens
    expect(() => {
      const tkn = new KapToken(new Uint8Array(0));
      const transferArgs = new token.transfer_arguments(MOCK_ACCT1, MOCK_ACCT1, 10);
      tkn.transfer(transferArgs);
    }).toThrow();

    // check balances
    let balanceArgs = new token.balance_of_arguments(MOCK_ACCT1);
    let balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(123);

    // check error message
    expect(MockVM.getErrorMessage()).toBe('cannot transfer to yourself');
  });

  it("should not transfer if insufficient balance", () => {
    const tkn = new KapToken(new Uint8Array(0));

    // set kernel mode
    MockVM.setCaller(new chain.caller_data(new Uint8Array(0), chain.privilege.kernel_mode));

    // set contract_call authority for CONTRACT_ID to true so that we can mint tokens
    const authContractId = new MockVM.MockAuthority(authority.authorization_type.contract_call, CONTRACT_ID, true);

    // set contract_call authority for MOCK_ACCT1 to true so that we can transfer tokens
    const authMockAcct1 = new MockVM.MockAuthority(authority.authorization_type.contract_call, MOCK_ACCT1, true);
    MockVM.setAuthorities([authContractId, authMockAcct1]);

    // mint tokens
    const mintArgs = new token.mint_arguments(MOCK_ACCT1, 123);
    tkn.mint(mintArgs);

    // save the MockVM state because the transfer is going to revert the transaction
    MockVM.commitTransaction();

    // try to transfer tokens
    expect(() => {
      const tkn = new KapToken(new Uint8Array(0));
      const transferArgs = new token.transfer_arguments(MOCK_ACCT1, MOCK_ACCT2, 456);
      tkn.transfer(transferArgs);
    }).toThrow();

    // check balances
    let balanceArgs = new token.balance_of_arguments(MOCK_ACCT1);
    let balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(123);

    // check error message
    expect(MockVM.getErrorMessage()).toBe("account 'from' has insufficient balance");
  });

  it("should delay effective balance", () => {
    const tkn = new KapToken(new Uint8Array(0));

    // set kernel mode
    MockVM.setCaller(new chain.caller_data(new Uint8Array(0), chain.privilege.kernel_mode));

    // set contract_call authority for CONTRACT_ID to true so that we can mint tokens
    const authContractId = new MockVM.MockAuthority(authority.authorization_type.contract_call, CONTRACT_ID, true);

    // set contract_call authority for MOCK_ACCT1 to true so that we can transfer tokens
    const authMockAcct1 = new MockVM.MockAuthority(authority.authorization_type.contract_call, MOCK_ACCT1, true);
    const authMockAcct2 = new MockVM.MockAuthority(authority.authorization_type.contract_call, MOCK_ACCT2, true);

    MockVM.setAuthorities([authContractId]);

    const effectiveBalanceMockAcct1 = new vhp.effective_balance_of_arguments(MOCK_ACCT1);
    const effectiveBalanceMockAcct2 = new vhp.effective_balance_of_arguments(MOCK_ACCT2);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(0);

    // mint tokens
    const mintArgs = new token.mint_arguments(MOCK_ACCT1, 100);
    tkn.mint(mintArgs);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(0);

    headBlock.header!.height = 29;
    MockVM.setBlock(headBlock);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(0);

    headBlock.header!.height = 30;
    MockVM.setBlock(headBlock);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(100);

    const transferArgs = new token.transfer_arguments(MOCK_ACCT1, MOCK_ACCT2, 1);
    MockVM.setAuthorities([authMockAcct1, authMockAcct1, authMockAcct1, authMockAcct1]);

    tkn.transfer(transferArgs);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(99);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(0);

    tkn.transfer(transferArgs);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(98);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(0);

    headBlock.header!.height = 31;
    MockVM.setBlock(headBlock);

    tkn.transfer(transferArgs);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(97);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(0);

    headBlock.header!.height = 35;
    MockVM.setBlock(headBlock);

    tkn.transfer(transferArgs);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(96);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(0);

    headBlock.header!.height = 49;
    MockVM.setBlock(headBlock);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(96);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(0);

    headBlock.header!.height = 50;
    MockVM.setBlock(headBlock);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(96);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(2);

    headBlock.header!.height = 51;
    MockVM.setBlock(headBlock);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(96);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(3);

    headBlock.header!.height = 54;
    MockVM.setBlock(headBlock);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(96);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(3);

    headBlock.header!.height = 55;
    MockVM.setBlock(headBlock);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(96);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(4);

    MockVM.setAuthorities([authMockAcct1, authMockAcct2]);

    tkn.transfer(transferArgs);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(95);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(4);

    headBlock.header!.height = 56;
    MockVM.setBlock(headBlock);

    transferArgs.from = MOCK_ACCT2;
    transferArgs.to = MOCK_ACCT1;
    transferArgs.value = 4;

    tkn.transfer(transferArgs);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(95);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(0);

    headBlock.header!.height = 74;
    MockVM.setBlock(headBlock);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(95);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(0);

    headBlock.header!.height = 75;
    MockVM.setBlock(headBlock);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(95);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(1);

    headBlock.header!.height = 76;
    MockVM.setBlock(headBlock);

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct1).value).toBe(99);
    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(1);

    MockVM.setAuthorities([authMockAcct2]);
    tkn.burn(new token.burn_arguments(MOCK_ACCT2, 1));

    expect(tkn.effective_balance_of(effectiveBalanceMockAcct2).value).toBe(0);
  });

  it("should transfer tokens without authority", () => {
    const tkn = new KapToken(new Uint8Array(0));

    // set kernel mode
    MockVM.setCaller(new chain.caller_data(new Uint8Array(0), chain.privilege.kernel_mode));

    // set contract_call authority for CONTRACT_ID to true so that we can mint tokens
    const authContractId = new MockVM.MockAuthority(authority.authorization_type.contract_call, CONTRACT_ID, true);

    MockVM.setAuthorities([authContractId]);

    // mint tokens
    const mintArgs = new token.mint_arguments(MOCK_ACCT1, 123);
    tkn.mint(mintArgs);

    // set caller with MOCK_ACCT1 to allow transfer if the caller is the same from
    MockVM.setCaller(new chain.caller_data(MOCK_ACCT1, chain.privilege.kernel_mode));

    // transfer tokens
    const transferArgs = new token.transfer_arguments(MOCK_ACCT1, MOCK_ACCT2, 10);
    tkn.transfer(transferArgs);

    // check balances
    let balanceArgs = new token.balance_of_arguments(MOCK_ACCT1);
    let balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(113);

    balanceArgs = new token.balance_of_arguments(MOCK_ACCT2);
    balanceRes = tkn.balance_of(balanceArgs);
    expect(balanceRes.value).toBe(10);

    // check events
    const events = MockVM.getEvents();
    // 2 events, 1st one is the mint event, the second one is the transfer event
    expect(events.length).toBe(2);
    expect(events[1].name).toBe('kap.token.transfer_event');
    expect(events[1].impacted.length).toBe(2);
    expect(Arrays.equal(events[1].impacted[0], MOCK_ACCT2)).toBe(true);
    expect(Arrays.equal(events[1].impacted[1], MOCK_ACCT1)).toBe(true);

    const transferEvent = Protobuf.decode<token.transfer_event>(events[1].data, token.transfer_event.decode);
    expect(Arrays.equal(transferEvent.from, MOCK_ACCT1)).toBe(true);
    expect(Arrays.equal(transferEvent.to, MOCK_ACCT2)).toBe(true);
    expect(transferEvent.value).toBe(10);
  });
});
