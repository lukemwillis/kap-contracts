import { createHash, randomUUID } from 'crypto';

const result = {
  codes: [],
};

for (let i = 0; i < 10000; i++) {
  const code = randomUUID();
  const hash = createHash('sha256').update(code).digest();
  result.codes.push({
    code,
    hash: `0x1220${hash.toString('hex')}`,
  });
}

console.log(result);