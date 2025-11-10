// tests/unit/fragments-advanced.test.js
const request = require('supertest');
const app = require('../../src/app');

const authUser = () => ['user1@email.com', 'password1'];

describe('Advanced Fragments API', () => {
  test('GET /v1/fragments?expand=1 returns metadata objects', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth(...authUser());
    expect(res.statusCode).toBe(200);
    expect(res.body.fragments[0]).toHaveProperty('id');
  });

  test('GET /v1/fragments/:id/info returns metadata', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...authUser())
      .set('Content-Type', 'text/markdown')
      .send('# Hello world');
    const id = postRes.body.fragment.id;
    const infoRes = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth(...authUser());
    expect(infoRes.statusCode).toBe(200);
    expect(infoRes.body.fragment.id).toBe(id);
  });

  test('GET /v1/fragments/:id.html converts markdown to html', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...authUser())
      .set('Content-Type', 'text/markdown')
      .send('# Heading');
    const id = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth(...authUser());
    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toContain('<h1>Heading</h1>');
  });
});
