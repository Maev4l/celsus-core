const { assert } = require('chai');
const { Pool } = require('pg');
require('dotenv').config();

const {
  deleteLibrary,
} = require('../handler');
const { newMockEvent } = require('./utils');

describe('Libraries Tests (DELETE)', async () => {
  it('Deletes an existing library', async () => {
    const id = '4';
    const event = newMockEvent('user2', '', { id });
    const response = await deleteLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 204);
    const pool = new Pool();
    const client = await pool.connect();
    const librariesResult = await client.query('SELECT "id", "name", "description" FROM "celsus"."library" WHERE "id"=$1;', [id]);
    assert.strictEqual(librariesResult.rows.length, 0);
    const booksResult = await client.query('SELECT "id" FROM "celsus"."book" WHERE "library_id"=$1;', [id]);
    assert.strictEqual(booksResult.rows.length, 0);
    client.release();
    await pool.end();
  });

  it('Fails when deleting an unknown library', async () => {
    const id = 'xxx';
    const event = newMockEvent('user2', '', { id });
    const response = await deleteLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
  });

  it('Fails when deleting a library belonging to an unknown user', async () => {
    const id = '5';
    const event = newMockEvent('xxx', '', { id });
    const response = await deleteLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT "id", "name", "description" FROM "celsus"."library" WHERE "id"=$1;', [id]);
    assert.strictEqual(rows.length, 1);
    client.release();
    await pool.end();
  });

  it('Fails when deleting a library not belonging to user', async () => {
    const id = '1';
    const event = newMockEvent('user2', '', { id });
    const response = await deleteLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT "id", "name", "description" FROM "celsus"."library" WHERE "id"=$1;', [id]);
    assert.strictEqual(rows.length, 1);
    client.release();
    await pool.end();
  });
});