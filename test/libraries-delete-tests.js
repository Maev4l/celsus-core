import { assert } from 'chai';

import dotenv from 'dotenv';

import { deleteLibrary } from '../src/handler';
import { newMockEvent } from './utils';
import { getDatabase } from '../src/lib/storage';

dotenv.config();

const schemaName = process.env.PGSCHEMA;
const database = getDatabase();

describe('Libraries Tests (DELETE)', async () => {
  it('Deletes an existing library', async () => {
    const id = '4';
    const event = newMockEvent('user2', '', { id });
    const response = await deleteLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 204);

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

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rows.length, 1);
  });

  it('Fails when deleting a library not belonging to user', async () => {
    const id = '1';
    const event = newMockEvent('user2', '', { id });
    const response = await deleteLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rows.length, 1);
  });
});
