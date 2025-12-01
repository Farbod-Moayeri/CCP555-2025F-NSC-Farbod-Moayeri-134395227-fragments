// tests/unit/fragments-advanced.test.js
const request = require('supertest');
const app = require('../../src/app');

const authUser = () => ['user1@email.com', 'password1'];

describe('Advanced Fragments API', () => {
  beforeAll(async () => {
    // create a fragment so it exists before GET tests
    await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth(...authUser())
      .send('hello world');
  });

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

  // ───────────────────────────────────────────────────────────────
  // NEW: image conversion using sharp via .ext
  // ───────────────────────────────────────────────────────────────
  test('GET /v1/fragments/:id.jpg converts PNG image to JPEG', async () => {
    // Tiny valid 1x1 PNG (base64)
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBAAZaFksAAAAASUVORK5CYII=';
    const imgBuffer = Buffer.from(pngBase64, 'base64');

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(...authUser())
      .set('Content-Type', 'image/png')
      .send(imgBuffer);

    expect(postRes.statusCode).toBe(201);
    const id = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.jpg`)
      .auth(...authUser());

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toMatch(/^image\/jpeg/);
    expect(getRes.body.length).toBeGreaterThan(0);
  });
});
