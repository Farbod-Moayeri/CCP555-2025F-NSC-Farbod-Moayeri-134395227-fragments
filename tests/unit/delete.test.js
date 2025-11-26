/**
 * Jest tests for DELETE /v1/fragments/:id
 */

const request = require('supertest');
const app = require('../../src/app'); // your Express app
const { authHeader, otherAuthHeader } = require('./utils/auth'); // same utility used in other tests

describe('DELETE /v1/fragments/:id', () => {
  let createdId = null;

  test('authenticated user can delete their fragment', async () => {
    // Create a fragment first
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader)
      .set('Content-Type', 'text/plain')
      .send('hello test delete');

    expect(createRes.statusCode).toBe(201);
    createdId = createRes.body.fragment.id;

    // Delete the fragment
    const deleteRes = await request(app)
      .delete(`/v1/fragments/${createdId}`)
      .set('Authorization', authHeader);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.status).toBe('deleted');

    // Confirm it's gone
    const getRes = await request(app)
      .get(`/v1/fragments/${createdId}`)
      .set('Authorization', authHeader);

    expect(getRes.statusCode).toBe(404);
  });

  test('returns 404 when deleting a non-existent fragment', async () => {
    const res = await request(app)
      .delete('/v1/fragments/does-not-exist')
      .set('Authorization', authHeader);

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('returns 401 if no auth is provided', async () => {
    const res = await request(app).delete('/v1/fragments/some-id');

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('error');
  });

  test('returns 404 if another user tries to delete your fragment', async () => {
    // Create a fragment with the main user
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Authorization', authHeader)
      .set('Content-Type', 'text/plain')
      .send('fragment to block delete');

    expect(createRes.statusCode).toBe(201);
    const id = createRes.body.fragment.id;

    // Other user tries deleting it
    const res = await request(app)
      .delete(`/v1/fragments/${id}`)
      .set('Authorization', otherAuthHeader);

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });
});
