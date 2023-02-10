import { Usdoracle } from '../Usdoracle';
import { usdoracle } from '../proto/usdoracle';

describe('contract', () => {
  it("should return 'hello, NAME!'", () => {
    const c = new Usdoracle();

    const args = new usdoracle.hello_arguments('World');
    const res = c.hello(args);

    expect(res.value).toStrictEqual('Hello, World!');
  });
});
