// tests/unit/fragments-api.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Fragments API', () => {
  const authUser = () => ['user1@email.com', 'password1'];

  test('POST /v1/fragments with unsupported type returns 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(...authUser())
      .set('Content-Type', 'application/xml')
      .send(JSON.stringify({ msg: 'nope' }));
    expect(res.statusCode).toBe(415);
  });

  test('POST /v1/fragments without body returns 400', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(...authUser())
      .set('Content-Type', 'text/plain');
    expect(res.statusCode).toBe(400);
  });

  test('authenticated user can POST text/plain fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(...authUser())
      .set('Content-Type', 'text/plain')
      .send('hello world');
    expect(res.statusCode).toBe(201);
    expect(res.headers).toHaveProperty('location');
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toHaveProperty('id');
  });

  test('GET /v1/fragments returns an array of fragment ids', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth(...authUser());
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('GET /v1/fragments/:id returns fragment data', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...authUser())
      .set('Content-Type', 'text/plain')
      .send('test fragment data');
    const id = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth(...authUser());
    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe('test fragment data');
  });

  test('GET /v1/fragments/:id with wrong id returns 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist')
      .auth(...authUser());
    expect(res.statusCode).toBe(404);
  });

  // ───────────────────────────────────────────────────────────────
  // NEW TESTS: images + PUT /fragments/:id
  // ───────────────────────────────────────────────────────────────

  test('authenticated user can POST image/png fragment', async () => {
    // Tiny fake PNG header bytes (not used for conversion here)
    const imgBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

    const res = await request(app)
      .post('/v1/fragments')
      .auth(...authUser())
      .set('Content-Type', 'image/png')
      .send(imgBuffer);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment.type).toBe('image/png');
  });

  test('PUT /v1/fragments/:id updates an existing text fragment', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...authUser())
      .set('Content-Type', 'text/plain')
      .send('original text');
    expect(createRes.statusCode).toBe(201);
    const id = createRes.body.fragment.id;

    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth(...authUser())
      .set('Content-Type', 'text/plain')
      .send('updated text');
    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.status).toBe('ok');
    expect(putRes.body.fragment.id).toBe(id);

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth(...authUser());
    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe('updated text');
  });

  test('PUT /v1/fragments/:id with mismatched type returns 400', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(...authUser())
      .set('Content-Type', 'text/plain')
      .send('original text');
    const id = createRes.body.fragment.id;

    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth(...authUser())
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ changed: true }));
    expect(putRes.statusCode).toBe(400);
    expect(putRes.body.status).toBe('error');
  });

  test('PUT /v1/fragments/:id for non-existent fragment returns 404', async () => {
    const putRes = await request(app)
      .put('/v1/fragments/does-not-exist')
      .auth(...authUser())
      .set('Content-Type', 'text/plain')
      .send('updated');
    expect(putRes.statusCode).toBe(404);
    expect(putRes.body.status).toBe('error');
  });
});
