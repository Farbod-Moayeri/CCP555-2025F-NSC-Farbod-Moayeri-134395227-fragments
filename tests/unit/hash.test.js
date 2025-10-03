// tests/unit/hash.test.js
const hash = require('../../src/hash');

describe('hash()', () => {
  test('hashing the same string produces the same result', () => {
    const a = hash('user@example.com');
    const b = hash('user@example.com');
    expect(a).toBe(b);
  });

  test('different strings produce different hashes', () => {
    const a = hash('user1@example.com');
    const b = hash('user2@example.com');
    expect(a).not.toBe(b);
  });

  test('throws if input is missing', () => {
    expect(() => hash()).toThrow();
  });
});
