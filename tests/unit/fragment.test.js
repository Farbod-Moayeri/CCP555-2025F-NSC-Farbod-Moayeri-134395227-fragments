// tests/unit/fragment.test.js
const Fragment = require('../../src/model/fragment');

describe('Fragment class', () => {
  const ownerId = 'hashed-user';

  test('isSupportedType() only accepts text/plain', () => {
    expect(Fragment.isSupportedType('text/plain')).toBe(true);
    expect(Fragment.isSupportedType('application/json')).toBe(false);
  });

  test('create() makes a new fragment and byId() retrieves it', async () => {
    const fragment = await Fragment.create({ ownerId, type: 'text/plain' });
    expect(fragment).toBeInstanceOf(Fragment);

    const found = await Fragment.byId(ownerId, fragment.id);
    expect(found.id).toBe(fragment.id);
  });

  test('saveData() stores Buffer data and getData() retrieves it', async () => {
    const fragment = await Fragment.create({ ownerId, type: 'text/plain' });
    const buffer = Buffer.from('hello fragments');
    await fragment.saveData(buffer);

    const data = await fragment.getData();
    expect(data.toString()).toBe('hello fragments');
    expect(fragment.size).toBe(buffer.length);
  });

  test('list() returns user fragments', async () => {
    const fragment = await Fragment.create({ ownerId, type: 'text/plain' });
    const list = await Fragment.list(ownerId);
    const ids = list.map((f) => f.id);
    expect(ids).toContain(fragment.id);
  });
});
