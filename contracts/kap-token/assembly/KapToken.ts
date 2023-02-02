import { Arrays, authority, chain, error, Protobuf, System, token, vhp } from "@koinos/sdk-as";

namespace Constants {
  export const NAME = "Koinos Account Protocol Token";
  export const SYMBOL = "KAP";
  export const DECIMALS: u32 = 8;
  export const SUPPLY_ID: u32 = 0;
  export const BALANCE_ID: u32 = 1;
  export const SUPPLY_KEY = new Uint8Array(0);
  export const DELAY_BLOCKS: u64 = 20;

  let contractId: Uint8Array | null = null;

  export function ContractId() : Uint8Array {
    if (contractId === null) {
      contractId = System.getContractId();
    }

    return contractId!;
  }
}

namespace State {
  export namespace Space {
    let supply : chain.object_space | null = null;
    let balance : chain.object_space | null = null;

    export function Supply() : chain.object_space {
      if (supply === null) {
        supply = new chain.object_space(true, Constants.ContractId(), 0);
      }

      return supply!;
    }

    export function Balance() : chain.object_space {
      if (balance === null) {
        balance = new chain.object_space(true, Constants.ContractId(), 1);
      }

      return balance!;
    }
  }
}

export class KapToken {
  private _arguments: Uint8Array = new Uint8Array(0);

  constructor(args: Uint8Array) {
    this._arguments = args;
  }

  name(args?: token.name_arguments): token.name_result {
    let result = new token.name_result();
    result.value = Constants.NAME;
    return result;
  }

  symbol(args?: token.symbol_arguments): token.symbol_result {
    let result = new token.symbol_result();
    result.value = Constants.SYMBOL;
    return result;
  }

  decimals(args?: token.decimals_arguments): token.decimals_result {
    let result = new token.decimals_result();
    result.value = Constants.DECIMALS;
    return result;
  }

  total_supply(args?: token.total_supply_arguments): token.total_supply_result {
    let result = new token.total_supply_result();

    let supplyObject = System.getObject<Uint8Array, token.balance_object>(State.Space.Supply(), Constants.SUPPLY_KEY, token.balance_object.decode);

    if (!supplyObject) {
      result.value = 0;
    }
    else {
      result.value = supplyObject.value;
    }

    return result;
  }

  balance_of(args: token.balance_of_arguments): token.balance_of_result {
    let result = new token.balance_of_result();

    System.require(args.owner != null, 'owner cannot be null');

    let balanceObj = System.getObject<Uint8Array, vhp.effective_balance_object>(State.Space.Balance(), args.owner, vhp.effective_balance_object.decode);

    if (!balanceObj) {
      result.value = 0;
    }
    else {
      result.value = balanceObj.current_balance;
    }

    return result;
  }

  effective_balance_of(args: vhp.effective_balance_of_arguments): vhp.effective_balance_of_result {
    let result = new vhp.effective_balance_of_result();

    System.require(args.owner != null, 'owner cannot be null');

    let balanceObj = System.getObject<Uint8Array, vhp.effective_balance_object>(State.Space.Balance(), args.owner, vhp.effective_balance_object.decode);

    if (!balanceObj) {
      // No balance object means a balance of 0
      result.value = 0;
    }
    else if (balanceObj.past_balances.length == 0) {
      // No past balances means the current balance is the effective balance
      result.value = balanceObj.current_balance;
    }
    else {
      // Otherwise, we need to find the most recent valid past balance
      this.trim_balances(balanceObj, System.getBlockField("header.height")!.uint64_value);
      result.value = balanceObj.past_balances[0].balance;
    }

    return result;
  }

  increase_balance_by(balanceObj: vhp.effective_balance_object, blockHeight: u64, value: u64): void {
    this.trim_balances(balanceObj, blockHeight);

    let snapshotLength = balanceObj.past_balances.length;

    if (snapshotLength == 0) {
      balanceObj.past_balances.push(new vhp.balance_entry(blockHeight - 1, balanceObj.current_balance));
      snapshotLength = 1;
    }

    let newBalance = balanceObj.current_balance + value;
    balanceObj.current_balance = newBalance;

    // If there is no entry for this block's balance, set it.
    // Otherwise, push it to the back
    if (balanceObj.past_balances[snapshotLength - 1].block_height != blockHeight ) {
      balanceObj.past_balances.push(new vhp.balance_entry(blockHeight, newBalance));
    }
    else {
      balanceObj.past_balances[snapshotLength - 1].balance = newBalance;
    }
  }

  decrease_balance_by(balanceObj: vhp.effective_balance_object, blockHeight: u64, value: u64): void {
    this.trim_balances(balanceObj, blockHeight);

    balanceObj.current_balance -= value;

    for (let i = 0; i < balanceObj.past_balances.length; i++ ) {
      if (balanceObj.past_balances[i].balance < value) {
        balanceObj.past_balances[i].balance = 0;
      } else {
        balanceObj.past_balances[i].balance -= value;
      }
    }
  }

  trim_balances(balanceObj: vhp.effective_balance_object, blockHeight: u64): void {
    if (balanceObj.past_balances.length <= 1)
      return;

    let limitBlock = blockHeight - Constants.DELAY_BLOCKS;

    if (blockHeight < Constants.DELAY_BLOCKS) {
      limitBlock = 0;
    }

    while( balanceObj.past_balances.length > 1 && balanceObj.past_balances[1].block_height <= limitBlock ) {
      balanceObj.past_balances.shift();
    }
  }

  transfer(args: token.transfer_arguments): token.transfer_result {
    System.require(args.to != null, 'to cannot be null');
    System.require(args.from != null, 'from cannot be null');
    System.require(args.to != args.from, 'cannot transfer to yourself');

    let callerData = System.getCaller();
    System.require(
      Arrays.equal(callerData.caller, args.from) || System.checkAuthority(authority.authorization_type.contract_call, args.from, this._arguments),
      'from has not authorized transfer',
      error.error_code.authorization_failure
    );

    let fromBalanceObj = System.getObject<Uint8Array, vhp.effective_balance_object>(State.Space.Balance(), args.from, vhp.effective_balance_object.decode);

    if (!fromBalanceObj) {
      fromBalanceObj = new vhp.effective_balance_object();
      fromBalanceObj.current_balance = 0;
    }

    System.require(fromBalanceObj.current_balance >= args.value, "account 'from' has insufficient balance", error.error_code.failure);

    let toBalanceObj = System.getObject<Uint8Array, vhp.effective_balance_object>(State.Space.Balance(), args.to, vhp.effective_balance_object.decode);

    if (!toBalanceObj) {
      toBalanceObj = new vhp.effective_balance_object();
      toBalanceObj.current_balance = 0;
    }

    let blockHeight = System.getBlockField("header.height")!.uint64_value;
    this.decrease_balance_by(fromBalanceObj, blockHeight, args.value);
    this.increase_balance_by(toBalanceObj, blockHeight, args.value);

    System.putObject(State.Space.Balance(), args.from, fromBalanceObj, vhp.effective_balance_object.encode);
    System.putObject(State.Space.Balance(), args.to, toBalanceObj, vhp.effective_balance_object.encode);

    let event = new token.transfer_event();
    event.from = args.from;
    event.to = args.to;
    event.value = args.value;

    let impacted: Uint8Array[] = [];
    impacted.push(args.to);
    impacted.push(args.from);

    System.event('kap.token.transfer_event', Protobuf.encode(event, token.transfer_event.encode), impacted);

    return new token.transfer_result();
  }

  mint(args: token.mint_arguments): token.mint_result {
    System.require(args.to != null, "mint argument 'to' cannot be null");
    System.require(args.value != 0, "mint argument 'value' cannot be zero");

    if (System.getCaller().caller_privilege != chain.privilege.kernel_mode) {
      if (BUILD_FOR_TESTING) {
        System.requireAuthority(authority.authorization_type.contract_call, Constants.ContractId());
      }
      else {
        System.fail('insufficient privileges to mint', error.error_code.authorization_failure);
      }
    }

    let supplyObject = System.getObject<Uint8Array, token.balance_object>(State.Space.Supply(), Constants.SUPPLY_KEY, token.balance_object.decode);

    if (!supplyObject) {
      supplyObject = new token.balance_object();
      supplyObject.value = 0;
    }

    System.require(supplyObject.value <= u64.MAX_VALUE - args.value, 'mint would overflow supply', error.error_code.failure);

    let balanceObject = System.getObject<Uint8Array, vhp.effective_balance_object>(State.Space.Balance(), args.to, vhp.effective_balance_object.decode);

    if (!balanceObject) {
      balanceObject = new vhp.effective_balance_object();
      balanceObject.current_balance = 0;
    }

    this.increase_balance_by(balanceObject, System.getBlockField("header.height")!.uint64_value, args.value);
    supplyObject.value += args.value;

    System.putObject(State.Space.Supply(), Constants.SUPPLY_KEY, supplyObject, token.balance_object.encode);
    System.putObject(State.Space.Balance(), args.to, balanceObject, vhp.effective_balance_object.encode);

    let event = new token.mint_event();
    event.to = args.to;
    event.value = args.value;

    let impacted: Uint8Array[] = [];
    impacted.push(args.to);

    System.event('kap.token.mint_event', Protobuf.encode(event, token.mint_event.encode), impacted);

    return new token.mint_result();
  }

  burn(args: token.burn_arguments): token.burn_result {
    System.require(args.from != null, "burn argument 'from' cannot be null");

    let callerData = System.getCaller();
    System.require(
      callerData.caller_privilege == chain.privilege.kernel_mode || callerData.caller == args.from || System.checkAuthority(authority.authorization_type.contract_call, args.from, this._arguments),
      'from has not authorized burn',
      error.error_code.authorization_failure
    );

    let fromBalanceObject = System.getObject<Uint8Array, vhp.effective_balance_object>(State.Space.Balance(), args.from, vhp.effective_balance_object.decode);

    if (fromBalanceObject == null) {
      fromBalanceObject = new vhp.effective_balance_object();
      fromBalanceObject.current_balance = 0;
    }

    System.require(fromBalanceObject.current_balance >= args.value, "account 'from' has insufficient balance", error.error_code.failure);

    let supplyObject = System.getObject<Uint8Array, token.balance_object>(State.Space.Supply(), Constants.SUPPLY_KEY, token.balance_object.decode);

    if (!supplyObject) {
      supplyObject = new token.balance_object();
      supplyObject.value = 0;
    }

    System.require(supplyObject.value >= args.value, 'burn would underflow supply', error.error_code.failure);

    supplyObject.value -= args.value;
    this.decrease_balance_by(fromBalanceObject, System.getBlockField("header.height")!.uint64_value, args.value);

    System.putObject(State.Space.Supply(), Constants.SUPPLY_KEY, supplyObject, token.balance_object.encode);
    System.putObject(State.Space.Balance(), args.from, fromBalanceObject, vhp.effective_balance_object.encode);

    let event = new token.burn_event();
    event.from = args.from;
    event.value = args.value;

    let impacted: Uint8Array[] = [];
    impacted.push(args.from);

    System.event('kap.token.burn_event', Protobuf.encode(event, token.burn_event.encode), impacted);

    return new token.burn_result();
  }
}
