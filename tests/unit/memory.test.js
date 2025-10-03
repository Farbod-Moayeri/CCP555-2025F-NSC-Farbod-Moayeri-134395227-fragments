// tests/unit/memory.test.js
const memory = require('../../src/model/data/memory');

describe('Memory Data API', () => {
  const ownerId = 'user2';
  const fragmentMeta = {
    id: 'frag2',
    ownerId,
    type: 'text/plain',
    size: 5,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  test('writeFragment() and readFragment()', async () => {
    await memory.writeFragment(ownerId, fragmentMeta);
    const result = await memory.readFragment(ownerId, 'frag2');
    expect(result.id).toBe('frag2');
  });

  test('writeFragmentData() and readFragmentData()', async () => {
    const buffer = Buffer.from('data test');
    await memory.writeFragmentData(ownerId, 'frag2', buffer);
    const result = await memory.readFragmentData(ownerId, 'frag2');
    expect(result.toString()).toBe('data test');
  });

  test('listFragments() returns array', async () => {
    const list = await memory.listFragments(ownerId);
    expect(list.some((f) => f.id === 'frag2')).toBe(true);
  });
});
