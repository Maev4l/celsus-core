const { assert } = require('chai');
const { Pool } = require('pg');
require('dotenv').config();

const {
  getLibraries, postLibrary, deleteLibrary, getLibrary,
} = require('../handler');
const { newMockEvent } = require('./utils');

describe('Libraries Tests', async () => {
  it('Returns list of libraries with no books', async () => {
    const event = newMockEvent('user1');

    const response = await getLibraries(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 200);
    const result = JSON.parse(body);
    assert.strictEqual(1, result.libraries.length);
    const expected = {
      libraries: [
        {
          id: '1',
          booksCount: 0,
          name: 'My Library Name',
          description: 'My Library description',
        },
      ],
    };
    assert.deepEqual(result, expected);
  });

  it('Returns list of libraries with some books', async () => {
    const event = newMockEvent('user4');

    const response = await getLibraries(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 200);
    const result = JSON.parse(body);
    assert.strictEqual(1, result.libraries.length);
    const expected = {
      libraries: [
        {
          id: '6',
          booksCount: 2,
          name: 'My Library Name',
          description: 'My Library description',
        },
      ],
    };
    assert.deepEqual(result, expected);
  });

  it('Adds a new library for user1', async () => {
    const event = newMockEvent('user1', { name: 'newLibrary', description: 'new description' });

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 201);
    const result = JSON.parse(body);
    assert.exists(result.id);
    assert.notEqual(result.id, '');

    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT "id", "name", "description" FROM "celsus"."library" WHERE "id"=$1;', [result.id]);
    assert.strictEqual(rows.length, 1);
    await client.query('DELETE FROM "celsus"."library" WHERE "id"=$1', [result.id]);
    client.release();
    await pool.end();
  });

  it('Fails when adding a library with empty name for user1', async () => {
    const event = newMockEvent('user1', { name: '', description: 'new description' });

    const pool = new Pool();
    const client = await pool.connect();
    const initialState = await client.query('SELECT * FROM "celsus"."library";');
    const initialCount = initialState.rowCount;

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 400);
    assert.isNotNull(body);
    assert.isNotEmpty(body);

    const actualState = await client.query('SELECT * FROM "celsus"."library";');
    const actualCount = actualState.rowCount;
    assert.strictEqual(initialCount, actualCount);
    client.release();
    await pool.end();
  });

  it('Fails when adding a library without name field for user1', async () => {
    const event = newMockEvent('user1', { description: 'no_name_library' });

    const pool = new Pool();
    const client = await pool.connect();
    const initialState = await client.query('SELECT * FROM "celsus"."library";');
    const initialCount = initialState.rowCount;

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 400);
    assert.isNotNull(body);
    assert.isNotEmpty(body);

    const actualState = await client.query('SELECT * FROM "celsus"."library";');
    const actualCount = actualState.rowCount;
    assert.strictEqual(initialCount, actualCount);
    client.release();
    await pool.end();
  });

  it('Fails when adding a library without description field for user1', async () => {
    const event = newMockEvent('user1', { name: 'no_description_library' });

    const pool = new Pool();
    const client = await pool.connect();
    const initialState = await client.query('SELECT * FROM "celsus"."library";');
    const initialCount = initialState.rowCount;

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 400);
    assert.isNotNull(body);
    assert.isNotEmpty(body);

    const actualState = await client.query('SELECT * FROM "celsus"."library";');
    const actualCount = actualState.rowCount;
    assert.strictEqual(initialCount, actualCount);
    client.release();
    await pool.end();
  });


  it('Fails when adding a library with too long name for user1', async () => {
    const longValue = `${'abcde'.repeat(20)}a`;
    const event = newMockEvent('user1', { name: longValue, description: '' });

    const pool = new Pool();
    const client = await pool.connect();
    const initialState = await client.query('SELECT * FROM "celsus"."library";');
    const initialCount = initialState.rowCount;

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 400);
    assert.isNotNull(body);
    assert.isNotEmpty(body);

    const actualState = await client.query('SELECT * FROM "celsus"."library";');
    const actualCount = actualState.rowCount;
    assert.strictEqual(initialCount, actualCount);
    client.release();
    await pool.end();
  });

  it('Fails when adding a library with too long description for user1', async () => {
    const longValue = `${'abcde'.repeat(110)}a`;
    const event = newMockEvent('user1', { name: 'long_desc_library', description: longValue });

    const pool = new Pool();
    const client = await pool.connect();
    const initialState = await client.query('SELECT * FROM "celsus"."library";');
    const initialCount = initialState.rowCount;

    const response = await postLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 400);
    assert.isNotNull(body);
    assert.isNotEmpty(body);

    const actualState = await client.query('SELECT * FROM "celsus"."library";');
    const actualCount = actualState.rowCount;
    assert.strictEqual(initialCount, actualCount);
    client.release();
    await pool.end();
  });

  it('Updates an existing library', async () => {
    const library = { id: '3', name: 'My Updated Book Title for user2', description: 'My Updated Book Description for user 2' };
    const event = newMockEvent('user2', library);
    const response = await postLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 204);
    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT "id", "name", "description" FROM "celsus"."library" WHERE "id"=$1;', [library.id]);
    assert.strictEqual(rows.length, 1);
    assert.deepEqual(rows[0], library);
    client.release();
    await pool.end();
  });

  it('Fails when updating an unknown library', async () => {
    const library = { id: 'xxx', name: 'My Updated Book Title for user2', description: 'My Updated Book Description for user 2' };
    const event = newMockEvent('user2', library);
    const response = await postLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);
    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT "id", "name", "description" FROM "celsus"."library" WHERE "id"=$1;', [library.id]);
    assert.strictEqual(rows.length, 0);
    client.release();
    await pool.end();
  });

  it('Fails when updating a library belonging to an unknown user', async () => {
    const library = { id: '1', name: 'My Updated Book Title for user2', description: 'My Updated Book Description for user 2' };
    const event = newMockEvent('xxx', library);
    const response = await postLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);
    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT "id", "name", "description" FROM "celsus"."library" WHERE "id"=$1;', [library.id]);
    assert.notDeepEqual(rows[0], library);
    client.release();
    await pool.end();
  });

  it('Fails when updating a library not belonging to user', async () => {
    const library = { id: '1', name: 'My Updated Book Title for user2', description: 'My Updated Book Description for user 2' };
    const event = newMockEvent('user2', library);
    const response = await postLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);
    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT "id", "name", "description" FROM "celsus"."library" WHERE "id"=$1;', [library.id]);
    assert.notDeepEqual(rows[0], library);
    client.release();
    await pool.end();
  });

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
    const id = '4';
    const event = newMockEvent('xxx', '', { id });
    const response = await deleteLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
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

  it('Returns a single library', async () => {
    const id = '5';
    const event = newMockEvent('user3', '', { id });

    const response = await getLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 200);
    const result = JSON.parse(body);
    const expected = {
      id: '5',
      booksCount: 0,
      name: 'My Library Name for user 3',
      description: 'To be read',
    };
    assert.deepEqual(result, expected);
  });

  it('Fails when fetching an unknown library', async () => {
    const id = 'xxx';
    const event = newMockEvent('user2', '', { id });
    const response = await getLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
  });

  it('Fails when fetching a library belonging to an unknown user', async () => {
    const id = '5';
    const event = newMockEvent('xxx', '', { id });
    const response = await getLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
  });

  it('Fails when fetching a library not belonging to user', async () => {
    const id = '5';
    const event = newMockEvent('user2', '', { id });
    const response = await getLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
  });
});
