import { Base58, MockVM, chain, protocol } from "@koinos/sdk-as";
import { Nameservice } from "../Nameservice";

const CONTRACT_ID = Base58.decode("1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqe");

let headBlock = new protocol.block();

describe("nameservice", () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(CONTRACT_ID);
    MockVM.setCaller(new chain.caller_data(new Uint8Array(0), chain.privilege.kernel_mode));

    headBlock.header = new protocol.block_header();
    headBlock.header!.height = 10;

    MockVM.setBlock(headBlock);
  });

  it("should parse a name into a name object", () => {
    const ns = new Nameservice();

    let name = 'domain';
    let nameObj = ns.parseName(name);

    expect(nameObj.name).toStrictEqual(name);
    expect(nameObj.domain).toStrictEqual(name);

    name = 'test-domain';
    nameObj = ns.parseName(name);

    expect(nameObj.name).toStrictEqual('test-domain');
    expect(nameObj.domain).toStrictEqual('test-domain');

    name = 'name.domain';
    nameObj = ns.parseName(name);

    expect(nameObj.name).toStrictEqual('name');
    expect(nameObj.domain).toStrictEqual('domain');

    name = 'name-test.domain';
    nameObj = ns.parseName(name);

    expect(nameObj.name).toStrictEqual('name-test');
    expect(nameObj.domain).toStrictEqual('domain');

    name = 'name.subdomain.domain';
    nameObj = ns.parseName(name);

    expect(nameObj.name).toStrictEqual('name');
    expect(nameObj.domain).toStrictEqual('subdomain.domain');

    name = 'name.subsubdomain.subdomain.domain';
    nameObj = ns.parseName(name);

    expect(nameObj.name).toStrictEqual('name');
    expect(nameObj.domain).toStrictEqual('subsubdomain.subdomain.domain');

    expect(() => {
      const ns = new Nameservice();

      const name = '.domain';
      ns.parseName(name);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('an element cannot be empty');

    expect(() => {
      const ns = new Nameservice();

      const name = 'domain.';
      ns.parseName(name);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('an element cannot be empty');

    expect(() => {
      const ns = new Nameservice();

      const name = 'name..domain';
      ns.parseName(name);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('an element cannot be empty');

    expect(() => {
      const ns = new Nameservice();

      const name = '-name.domain';
      ns.parseName(name);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('element "-name" cannot start with an hyphen (-)');

    expect(() => {
      const ns = new Nameservice();

      const name = 'name-.domain';
      ns.parseName(name);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('element "name-" cannot end with an hyphen (-)');

    expect(() => {
      const ns = new Nameservice();

      const name = 'name--test.domain';
      ns.parseName(name);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('element "name--test" cannot have consecutive hyphens (-)');

  });
});