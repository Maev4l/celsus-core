const { assert } = require('chai');
const { Pool } = require('pg');
require('dotenv').config();

const {
  deleteBook,
} = require('../handler');
const { newMockEvent } = require('./utils');


describe('Books Tests (DELETE)', async () => {
  it('Deletes an existing book', async () => {
    const id = '4';
    const event = newMockEvent('user5', '', { id });
    const response = await deleteBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 204);
    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT "id" FROM "celsus"."book" WHERE "id"=$1;', [id]);
    assert.strictEqual(rows.length, 0);
    client.release();
    await pool.end();
  });

  it('Fails when deleting an unknown book', async () => {
    const id = 'xxx';
    const event = newMockEvent('user2', '', { id });
    const response = await deleteBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
  });

  it('Fails when deleting a book belonging to an unknown user', async () => {
    const id = '1';
    const event = newMockEvent('xxx', '', { id });
    const response = await deleteBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT "id" FROM "celsus"."book" WHERE "id"=$1;', [id]);
    assert.strictEqual(rows.length, 1);
    client.release();
    await pool.end();
  });

  it('Fails when deleting a library not belonging to user', async () => {
    const id = '1';
    const event = newMockEvent('user2', '', { id });
    const response = await deleteBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT "id" FROM "celsus"."book" WHERE "id"=$1;', [id]);
    assert.strictEqual(rows.length, 1);
    client.release();
    await pool.end();
  });
});
