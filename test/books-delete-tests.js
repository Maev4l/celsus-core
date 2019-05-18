import { assert } from 'chai';
import { Pool } from 'pg';
import dotenv from 'dotenv';

import { deleteBook } from '../handler';
import { newMockEvent } from './utils';

dotenv.config();

const schemaName = process.env.PGSCHEMA;

describe('Books Tests (DELETE)', async () => {
  it('Deletes an existing book', async () => {
    const id = '4';
    const event = newMockEvent('user5', '', { id });

    const response = await deleteBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 204);
    const pool = new Pool();
    const client = await pool.connect();
    const { rows: rowsBooks } = await client.query(
      `SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rowsBooks.length, 0);

    const { rows: rowsSearch } = await client.query(
      `SELECT * FROM "${schemaName}"."books_search" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rowsSearch.length, 0);
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
    const { rows } = await client.query(`SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`, [
      id,
    ]);
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
    const { rows } = await client.query(`SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`, [
      id,
    ]);
    assert.strictEqual(rows.length, 1);
    client.release();
    await pool.end();
  });
});
