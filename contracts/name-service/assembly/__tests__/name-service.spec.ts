import { Base58, MockVM, chain, protocol, System } from "@koinos/sdk-as";
import { Collections } from "../Collections";
import { ParsedName } from "../ParsedName";

const CONTRACT_ID = Base58.decode("1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqe");

let headBlock = new protocol.block();

describe("Collections", () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(CONTRACT_ID);
    MockVM.setCaller(new chain.caller_data(new Uint8Array(0), chain.privilege.kernel_mode));

    headBlock.header = new protocol.block_header();
    headBlock.header!.height = 10;

    MockVM.setBlock(headBlock);

    MockVM.setHeadInfo(new chain.head_info(null, 123456789, 3));
  });

  it("should parse a name into a name object", () => {
    const ns = new Collections();

    let name = 'domain';
    let nameObj = new ParsedName(name);

    expect(nameObj.name).toStrictEqual(name);
    expect(nameObj.domain).toStrictEqual('');

    name = 'test-domain';
    nameObj = new ParsedName(name);

    expect(nameObj.name).toStrictEqual('test-domain');
    expect(nameObj.domain).toStrictEqual('');

    name = 'name.domain';
    nameObj = new ParsedName(name);

    expect(nameObj.name).toStrictEqual('name');
    expect(nameObj.domain).toStrictEqual('domain');

    name = 'name-test.domain';
    nameObj = new ParsedName(name);

    expect(nameObj.name).toStrictEqual('name-test');
    expect(nameObj.domain).toStrictEqual('domain');

    name = 'name.subdomain.domain';
    nameObj = new ParsedName(name);

    expect(nameObj.name).toStrictEqual('name');
    expect(nameObj.domain).toStrictEqual('subdomain.domain');

    name = 'name.subsubdomain.subdomain.domain';
    nameObj = new ParsedName(name);

    expect(nameObj.name).toStrictEqual('name');
    expect(nameObj.domain).toStrictEqual('subsubdomain.subdomain.domain');

    name = 'domain.';
    nameObj = new ParsedName(name);

    expect(nameObj.name).toStrictEqual('domain');
    expect(nameObj.domain).toStrictEqual('');

    name = 'name..domain';
    nameObj = new ParsedName(name);

    expect(nameObj.name).toStrictEqual('name');
    expect(nameObj.domain).toStrictEqual('.domain');


    expect(() => {
      const ns = new Collections();

      const name = '.domain';
      new ParsedName(name);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('an element cannot be empty');

    expect(() => {
      const ns = new Collections();

      const name = '-name.domain';
      new ParsedName(name);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('element "-name" cannot start or end with a hyphen (-)');

    expect(() => {
      const ns = new Collections();

      const name = 'name-.domain';
      new ParsedName(name);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('element "name-" cannot start or end with a hyphen (-)');

    expect(() => {
      const ns = new Collections();

      const name = 'name--test.domain';
      new ParsedName(name);
    }).toThrow();

    expect(MockVM.getErrorMessage()).toStrictEqual('element "name--test" cannot have consecutive hyphens (-)');

  });
});