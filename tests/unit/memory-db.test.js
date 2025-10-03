// tests/unit/memory-db.test.js
const db = require('../../src/model/data/memory/memory-db');

describe('MemoryDB', () => {
  const ownerId = 'user1';
  const fragmentMeta = {
    id: 'frag1',
    ownerId,
    type: 'text/plain',
    size: 0,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  test('writeFragment() and readFragment()', async () => {
    await db.writeFragment(ownerId, fragmentMeta);
    const result = await db.readFragment(ownerId, 'frag1');
    expect(result).toMatchObject(fragmentMeta);
  });

  test('writeFragmentData() and readFragmentData()', async () => {
    const buffer = Buffer.from('hello world');
    await db.writeFragmentData(ownerId, 'frag1', buffer);
    const result = await db.readFragmentData(ownerId, 'frag1');
    expect(result.toString()).toBe('hello world');
  });

  test('listFragments() returns array of metadata', async () => {
    const list = await db.listFragments(ownerId);
    expect(Array.isArray(list)).toBe(true);
    expect(list[0]).toHaveProperty('id');
  });

  test('reading unknown fragment returns null', async () => {
    const result = await db.readFragment(ownerId, 'does-not-exist');
    expect(result).toBeNull();
  });
});
