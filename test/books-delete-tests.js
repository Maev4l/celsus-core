import { assert } from 'chai';
import dotenv from 'dotenv';

import { deleteBook } from '../src/handler';
import { newMockEvent } from './utils';
import { getDatabase } from '../src/lib/storage';

dotenv.config();

const schemaName = process.env.PGSCHEMA;
const database = getDatabase();

describe('Books Tests (DELETE)', async () => {
  it('Deletes an existing book', async () => {
    const id = '4';
    const event = newMockEvent('user5', '', { id });

    const response = await deleteBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 204);

    const rowsBooks = await database.any(`SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`, [
      id,
    ]);
    assert.strictEqual(rowsBooks.length, 0);

    const rowsSearch = await database.any(
      `SELECT * FROM "${schemaName}"."books_search" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rowsSearch.length, 0);
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

    const rows = await database.any(`SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`, [id]);
    assert.strictEqual(rows.length, 1);
  });

  it('Fails when deleting a library not belonging to user', async () => {
    const id = '1';
    const event = newMockEvent('user2', '', { id });

    const response = await deleteBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);

    const rows = await database.any(`SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`, [id]);
    assert.strictEqual(rows.length, 1);
  });

  it('Fails when deleting a lent book', async () => {
    const id = '100';
    const event = newMockEvent('user11', '', { id });

    const response = await deleteBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);

    const rows = await database.any(`SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`, [id]);
    assert.strictEqual(rows.length, 1);
  });
});
