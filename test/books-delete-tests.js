import { assert } from 'chai';

import { deleteBook } from '../src/handler';
import { makeMockEvent, database, checkThumbnailExists } from './utils';

const schemaName = process.env.PGSCHEMA;

describe('Books Tests (DELETE)', async () => {
  it('Deletes an existing book with thumbnail', async () => {
    const id = '4';
    const event = makeMockEvent('user5', { id });

    const deleted = await deleteBook(event);
    assert.isTrue(deleted);

    const rowsBooks = await database.any(`SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`, [
      id,
    ]);
    assert.strictEqual(rowsBooks.length, 0);

    const rowsSearch = await database.any(
      `SELECT * FROM "${schemaName}"."books_search" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rowsSearch.length, 0);
    const { hash } = await checkThumbnailExists('user5', 4);
    assert.isNull(hash);
  });

  it('Deletes an existing book without thumbnail', async () => {
    const id = '5';
    const event = makeMockEvent('user5', { id });

    const deleted = await deleteBook(event);
    assert.isTrue(deleted);

    const rowsBooks = await database.any(`SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`, [
      id,
    ]);
    assert.strictEqual(rowsBooks.length, 0);

    const rowsSearch = await database.any(
      `SELECT * FROM "${schemaName}"."books_search" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rowsSearch.length, 0);
    const { hash } = await checkThumbnailExists('user5', 4);
    assert.isNull(hash);
  });

  it('Fails when deleting an unknown book', async () => {
    const id = 'xxx';
    const event = makeMockEvent('user2', { id });

    const deleted = await deleteBook(event);
    assert.isFalse(deleted);
  });

  it('Fails when deleting a book belonging to an unknown user', async () => {
    const id = '1';
    const event = makeMockEvent('xxx', { id });

    const deleted = await deleteBook(event);
    assert.isFalse(deleted);

    const rows = await database.any(`SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`, [id]);
    assert.strictEqual(rows.length, 1);
  });

  it('Fails when deleting a library not belonging to user', async () => {
    const id = '1';
    const event = makeMockEvent('user2', { id });

    const deleted = await deleteBook(event);
    assert.isFalse(deleted);

    const rows = await database.any(`SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`, [id]);
    assert.strictEqual(rows.length, 1);
  });

  it('Fails when deleting a lent book', async () => {
    const id = '100';
    const event = makeMockEvent('user11', { id });

    const deleted = await deleteBook(event);
    assert.isFalse(deleted);

    const rows = await database.any(`SELECT "id" FROM "${schemaName}"."book" WHERE "id"=$1;`, [id]);
    assert.strictEqual(rows.length, 1);
  });
});
