import { Multisig } from '../Multisig';
import { multisig } from '../proto/multisig';

describe('contract', () => {
  it("should return 'hello, NAME!'", () => {
    const c = new Multisig();

    const args = new multisig.hello_arguments('World');
    const res = c.hello(args);

    expect(res.value).toStrictEqual('Hello, World!');
  });
});
