import { Referral } from '../Referral';
import { referral } from '../proto/referral';

describe('contract', () => {
  it("should return 'hello, NAME!'", () => {
    const c = new Referral();

    const args = new referral.hello_arguments('World');
    const res = c.hello(args);

    expect(res.value).toStrictEqual('Hello, World!');
  });
});
