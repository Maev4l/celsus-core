import { assert } from 'chai';

import dotenv from 'dotenv';

import { deleteLibrary } from '../src/handler';
import { makeMockEvent } from './utils';
import { getDatabase } from '../src/lib/database';

dotenv.config();

const schemaName = process.env.PGSCHEMA;
const database = getDatabase();

describe('Libraries Tests (DELETE)', async () => {
  it('Deletes an existing library', async () => {
    const id = '4';
    const event = makeMockEvent('user2', { id });
    const deleted = await deleteLibrary(event);
    assert.isTrue(deleted);

    const librariesResult = await database.query(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(librariesResult.length, 0);
    const booksResult = await database.any(
      `SELECT "id" FROM "${schemaName}"."book" WHERE "library_id"=$1;`,
      [id],
    );
    assert.strictEqual(booksResult.length, 0);
  });

  it('Fails when deleting an unknown library', async () => {
    const id = 'xxx';
    const event = makeMockEvent('user2', { id });
    const deleted = await deleteLibrary(event);
    assert.isFalse(deleted);
  });

  it('Fails when deleting a library belonging to an unknown user', async () => {
    const id = '5';
    const event = makeMockEvent('xxx', { id });

    const deleted = await deleteLibrary(event);
    assert.isFalse(deleted);

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rows.length, 1);
  });

  it('Fails when deleting a library not belonging to user', async () => {
    const id = '1';
    const event = makeMockEvent('user2', { id });
    const deleted = await deleteLibrary(event);

    assert.isFalse(deleted);

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rows.length, 1);
  });

  it('Fails when deleting a library with lent books', async () => {
    const id = '100';
    const event = makeMockEvent('user11', { id });
    const deleted = await deleteLibrary(event);
    assert.isFalse(deleted);
  });

  it('Deletes an existing library with no books', async () => {
    const id = '103';
    const event = makeMockEvent('user13', { id });
    const deleted = await deleteLibrary(event);
    assert.isTrue(deleted);
    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rows.length, 0);
  });
});
