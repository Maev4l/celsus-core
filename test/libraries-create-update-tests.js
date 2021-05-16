import { assert } from 'chai';

import dotenv from 'dotenv';

import { postLibrary } from '../src/handler';
import { makeMockEvent } from './utils';
import { getDatabase } from '../src/lib/database';

dotenv.config();
const schemaName = process.env.PGSCHEMA;
const database = getDatabase();

describe('Libraries Tests (CREATE - UPDATE)', async () => {
  it('Adds a new library for user1', async () => {
    const event = makeMockEvent('user1', {
      library: { name: 'newLibrary', description: 'new description' },
    });

    const { id } = await postLibrary(event);
    assert.exists(id);
    assert.notEqual(id, '');

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rows.length, 1);

    const [library] = rows;
    const { name, description } = library;
    assert.strictEqual(name, 'newLibrary');
    assert.strictEqual(description, 'new description');

    await database.none(`DELETE FROM "${schemaName}"."library" WHERE "id"=$1`, [id]);
  });

  it('Fails when adding a library with empty name for user1', async () => {
    const event = makeMockEvent('user1', { library: { name: '', description: 'new description' } });

    const initialState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const initialCount = initialState.length;

    let thrown = false;
    try {
      await postLibrary(event);
    } catch (e) {
      thrown = true;
    }

    assert.isTrue(thrown);

    const actualState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const actualCount = actualState.length;
    assert.strictEqual(initialCount, actualCount);
  });

  it('Fails when adding a library without name field for user1', async () => {
    const event = makeMockEvent('user1', { library: { description: 'no_name_library' } });

    const initialState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const initialCount = initialState.length;

    let thrown = false;
    try {
      await postLibrary(event);
    } catch (e) {
      thrown = true;
    }
    assert.isTrue(thrown);

    const actualState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const actualCount = actualState.length;
    assert.strictEqual(initialCount, actualCount);
  });

  it('Fails when adding a library without description field for user1', async () => {
    const event = makeMockEvent('user1', { library: { name: 'no_description_library' } });

    const initialState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const initialCount = initialState.length;

    let thrown = false;
    try {
      await postLibrary(event);
    } catch (e) {
      thrown = true;
    }
    assert.isTrue(thrown);

    const actualState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const actualCount = actualState.length;
    assert.strictEqual(initialCount, actualCount);
  });

  it('Fails when adding a library with too long name for user1', async () => {
    const longValue = `${'abcde'.repeat(20)}a`;
    const event = makeMockEvent('user1', { library: { name: longValue, description: '' } });

    const initialState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const initialCount = initialState.length;

    let thrown = false;
    try {
      await postLibrary(event);
    } catch (e) {
      thrown = true;
    }
    assert.isTrue(thrown);

    const actualState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const actualCount = actualState.length;
    assert.strictEqual(initialCount, actualCount);
  });

  it('Fails when adding a library with too long description for user1', async () => {
    const longValue = `${'abcde'.repeat(110)}a`;
    const event = makeMockEvent('user1', {
      library: { name: 'long_desc_library', description: longValue },
    });

    const initialState = await database.any(`SELECT * FROM "${schemaName}"."library";`);
    const initialCount = initialState.length;

    let thrown = false;
    try {
      await postLibrary(event);
    } catch (e) {
      thrown = true;
    }
    assert.isTrue(thrown);

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
    const event = makeMockEvent('user2', { library });
    const updated = await postLibrary(event);
    assert.isTrue(updated);

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [library.id],
    );
    const [updatedLibrary] = rows;
    assert.strictEqual(rows.length, 1);
    assert.deepEqual(updatedLibrary, library);
  });

  it('Fails when updating an unknown library', async () => {
    const library = {
      id: 'xxx',
      name: 'My Updated Book Title for user2',
      description: 'My Updated Book Description for user 2',
    };
    const event = makeMockEvent('user2', { library });
    const updated = await postLibrary(event);
    assert.isFalse(updated);

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
    const event = makeMockEvent('xxx', { library });
    const updated = await postLibrary(event);
    assert.isFalse(updated);

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [library.id],
    );
    const [initialLibrary] = rows;
    assert.notDeepEqual(initialLibrary, library);
  });

  it('Fails when updating a library not belonging to user', async () => {
    const library = {
      id: '1',
      name: 'My Updated Book Title for user2',
      description: 'My Updated Book Description for user 2',
    };
    const event = makeMockEvent('user2', { library });
    const updated = await postLibrary(event);
    assert.isFalse(updated);

    const rows = await database.any(
      `SELECT "id", "name", "description" FROM "${schemaName}"."library" WHERE "id"=$1;`,
      [library.id],
    );
    const [initialLibrary] = rows;
    assert.notDeepEqual(initialLibrary, library);
  });
});
