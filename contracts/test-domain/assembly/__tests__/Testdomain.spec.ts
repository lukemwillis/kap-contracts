import { Testdomain } from '../Testdomain';
import { testdomain } from '../proto/testdomain';

describe('contract', () => {
  it("should return 'hello, NAME!'", () => {
    const c = new Testdomain();

    const args = new testdomain.hello_arguments('World');
    const res = c.hello(args);

    expect(res.value).toStrictEqual('Hello, World!');
  });
});
