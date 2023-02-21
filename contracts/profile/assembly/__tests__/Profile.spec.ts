import { Profile } from '../Profile';
import { profile } from '../proto/profile';

describe('contract', () => {
  it("should return 'hello, NAME!'", () => {
    const c = new Profile();

    const args = new profile.hello_arguments('World');
    const res = c.hello(args);

    expect(res.value).toStrictEqual('Hello, World!');
  });
});
