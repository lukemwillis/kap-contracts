import { Koindomain } from '../Koindomain';
import { koindomain } from '../proto/koindomain';

describe('contract', () => {
  it("should return 'hello, NAME!'", () => {
    const c = new Koindomain();

    const args = new koindomain.hello_arguments('World');
    const res = c.hello(args);

    expect(res.value).toStrictEqual('Hello, World!');
  });
});
