import { assert } from 'chai';

import dotenv from 'dotenv';

import { postLibrary } from '../src/handler';
import { newMockEvent } from './utils';
import { getDatabase } from '../src/lib/storage';

dotenv.config();
const schemaName = process.env.PGSCHEMA;
const database = getDatabase();

describe('Libraries Tests (CREATE - UPDATE)', async () => {
  it('Adds a new library for user1', async () => {
    const event = newMockEvent('user1', { name: 'newLibrary', description: 'new description' });

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 201);
    const result = JSON.parse(body);
    assert.exists(result.id);
    assert.notEqual(result.id, '');

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [result.id],
    );

    assert.strictEqual(rows.length, 1);
    await database.none(`DELETE FROM "${schemaName}"."library" WHERE "id"=$1`, [result.id]);
  });

  it('Fails when adding a library with empty name for user1', async () => {
    const event = newMockEvent('user1', { name: '', description: 'new description' });

    const initialState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const initialCount = initialState.length;

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 400);
    assert.isNotNull(body);
    assert.isNotEmpty(body);

    const actualState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const actualCount = actualState.length;
    assert.strictEqual(initialCount, actualCount);
  });

  it('Fails when adding a library without name field for user1', async () => {
    const event = newMockEvent('user1', { description: 'no_name_library' });

    const initialState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const initialCount = initialState.length;

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 400);
    assert.isNotNull(body);
    assert.isNotEmpty(body);

    const actualState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const actualCount = actualState.length;
    assert.strictEqual(initialCount, actualCount);
  });

  it('Fails when adding a library without description field for user1', async () => {
    const event = newMockEvent('user1', { name: 'no_description_library' });

    const initialState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const initialCount = initialState.length;

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 400);
    assert.isNotNull(body);
    assert.isNotEmpty(body);

    const actualState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const actualCount = actualState.length;
    assert.strictEqual(initialCount, actualCount);
  });

  it('Fails when adding a library with too long name for user1', async () => {
    const longValue = `${'abcde'.repeat(20)}a`;
    const event = newMockEvent('user1', { name: longValue, description: '' });

    const initialState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const initialCount = initialState.length;

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 400);
    assert.isNotNull(body);
    assert.isNotEmpty(body);

    const actualState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const actualCount = actualState.length;
    assert.strictEqual(initialCount, actualCount);
  });

  it('Fails when adding a library with too long description for user1', async () => {
    const longValue = `${'abcde'.repeat(110)}a`;
    const event = newMockEvent('user1', { name: 'long_desc_library', description: longValue });

    const initialState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const initialCount = initialState.length;

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 400);
    assert.isNotNull(body);
    assert.isNotEmpty(body);

    const actualState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const actualCount = actualState.length;
    assert.strictEqual(initialCount, actualCount);
  });

  it('Updates an existing library', async () => {
    const library = {
      id: '3',
      name: 'My Updated Book Title for user2',
      description: 'My Updated Book Description for user 2',
    };
    const event = newMockEvent('user2', library);
    const response = await postLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 204);

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [library.id],
    );
    assert.strictEqual(rows.length, 1);
    assert.deepEqual(rows[0], library);
  });

  it('Fails when updating an unknown library', async () => {
    const library = {
      id: 'xxx',
      name: 'My Updated Book Title for user2',
      description: 'My Updated Book Description for user 2',
    };
    const event = newMockEvent('user2', library);
    const response = await postLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [library.id],
    );
    assert.strictEqual(rows.length, 0);
  });

  it('Fails when updating a library belonging to an unknown user', async () => {
    const library = {
      id: '1',
      name: 'My Updated Book Title for user2',
      description: 'My Updated Book Description for user 2',
    };
    const event = newMockEvent('xxx', library);
    const response = await postLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [library.id],
    );
    assert.notDeepEqual(rows[0], library);
  });

  it('Fails when updating a library not belonging to user', async () => {
    const library = {
      id: '1',
      name: 'My Updated Book Title for user2',
      description: 'My Updated Book Description for user 2',
    };
    const event = newMockEvent('user2', library);
    const response = await postLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [library.id],
    );
    assert.notDeepEqual(rows[0], library);
  });
});
