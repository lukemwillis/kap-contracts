import { Testcollection } from '../Testcollection';
import { testcollection } from '../proto/testcollection';

describe('contract', () => {
  it("should return 'hello, NAME!'", () => {
    const c = new Testcollection();

    const args = new testcollection.hello_arguments('World');
    const res = c.hello(args);

    expect(res.value).toStrictEqual('Hello, World!');
  });
});
