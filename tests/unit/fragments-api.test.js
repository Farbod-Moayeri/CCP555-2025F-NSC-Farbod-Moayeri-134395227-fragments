// tests/unit/fragments-api.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Fragments API', () => {
  const authUser = () => ['user1@email.com', 'password1'];

  test('POST /v1/fragments with unsupported type returns 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(...authUser())
      .set('Content-Type', 'application/json')
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
});
