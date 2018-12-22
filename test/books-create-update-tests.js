/* eslint-disable global-require */
const { assert } = require('chai');
const { Pool } = require('pg');
const mockery = require('mockery');
require('dotenv').config();
const Utils = require('../lib/utils');

const { newMockEvent } = require('./utils');

const schemaName = process.env.PGSCHEMA;

describe('Books Tests (CREATE - UPDATE)', async () => {
  before('Setup mock', () => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false,
    });
    const messagingMock = {
      publish: () => {
        /* Nothing to do in mock */
      },
    };
    mockery.registerMock('./messaging', messagingMock);
  });

  after('Unregister mocks', () => {
    mockery.deregisterAll();
    mockery.resetCache();
    mockery.disable();
  });

  it('Adds a new book for user6', async () => {
    const libraryId = 'af9da085-4562-475f-baa5-38c3e5115c09';
    const newBook = {
      title: 'new book',
      libraryId,
      description: 'new description',
      thumbnail: '',
      authors: ['author1', 'author2'],
      tags: [],
      isbn10: '',
      isbn13: '',
    };
    const event = newMockEvent('user6', newBook);

    const { postBook } = require('../handler');

    const response = await postBook(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 201);
    const result = JSON.parse(body);
    assert.exists(result.id);
    assert.notEqual(result.id, '');

    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query(`SELECT * FROM "${schemaName}"."book" WHERE "id"=$1;`, [
      result.id,
    ]);
    assert.strictEqual(rows.length, 1);
    const expectedBook = rows[0];

    assert.strictEqual(expectedBook.library_id, libraryId);
    assert.strictEqual(expectedBook.title, newBook.title);
    assert.strictEqual(expectedBook.description, newBook.description);
    assert.deepEqual(expectedBook.authors, newBook.authors);
    assert.deepEqual(expectedBook.tags, newBook.tags);
    assert.isNotEmpty(expectedBook.hash);

    await client.query(`DELETE FROM "${schemaName}"."book" WHERE "id"=$1`, [result.id]);
    client.release();
    await pool.end();
  });

  it('Fails when adding a book to an unknown library', async () => {
    const libraryId = 'af9da085-4562-475f-baa5-38c3e5115c09';
    const newBook = {
      title: 'new book',
      libraryId,
      description: 'new description',
      thumbnail: '',
      authors: ['author1', 'author2'],
      tags: ['tag1', 'tag2'],
      isbn10: '',
      isbn13: '',
    };
    const event = newMockEvent('user1', newBook);

    const { postBook } = require('../handler');

    const response = await postBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);
  });

  it('Fails when adding a book to a library belonging to another user', async () => {
    const libraryId = 'xxx';
    const newBook = {
      title: 'new book',
      libraryId,
      description: 'new description',
      thumbnail: '',
      authors: ['author1', 'author2'],
      tags: ['tag1', 'tag2'],
      isbn10: '',
      isbn13: '',
    };
    const event = newMockEvent('user6', newBook);

    const { postBook } = require('../handler');

    const response = await postBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);
  });

  it('Update an existing book for user7', async () => {
    const libraryId = '73b57d71-4938-45cc-9880-51db8ebf3e7a';
    const id = '2894d16a-78fe-4dfc-a2b0-0a080898a490';
    const updateBook = {
      id,
      title: 'new book updated',
      libraryId,
      description: 'new description updated',
      thumbnail: '',
      authors: ['author1', 'author2'],
      tags: [],
      isbn10: '',
      isbn13: '',
    };
    const event = newMockEvent('user7', updateBook);

    const { postBook } = require('../handler');

    const response = await postBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 204);

    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query(`SELECT * FROM "${schemaName}"."book" WHERE "id"=$1;`, [
      id,
    ]);
    assert.strictEqual(rows.length, 1);
    const expectedBook = rows[0];

    assert.strictEqual(expectedBook.library_id, libraryId);
    assert.strictEqual(expectedBook.title, updateBook.title);
    assert.strictEqual(expectedBook.description, updateBook.description);
    assert.deepEqual(expectedBook.authors, updateBook.authors);
    assert.deepEqual(expectedBook.tags, updateBook.tags);
    assert.strictEqual(expectedBook.hash, Utils.hashBook(updateBook));

    client.release();
    await pool.end();
  });

  it('Fails when updating an unknown book for user7', async () => {
    const libraryId = '73b57d71-4938-45cc-9880-51db8ebf3e7a';
    const id = 'a798b3ee-ca87-4bdc-83ea-7824739df88c';
    const updateBook = {
      id,
      title: 'new book updated',
      libraryId,
      description: 'new description updated',
      thumbnail: '',
      authors: ['author1', 'author2'],
      tags: [],
      isbn10: '',
      isbn13: '',
    };
    const event = newMockEvent('user7', updateBook);

    const { postBook } = require('../handler');

    const response = await postBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);
  });

  it('Fails when updating a book to an unknown library', async () => {
    const libraryId = 'af9da085-4562-475f-baa5-38c3e5115c09';
    const id = '2894d16a-78fe-4dfc-a2b0-0a080898a490';
    const updateBook = {
      id,
      title: 'new book updated',
      libraryId,
      description: 'new description updated',
      thumbnail: '',
      authors: ['author1', 'author2'],
      tags: [],
      isbn10: '',
      isbn13: '',
    };
    const event = newMockEvent('user7', updateBook);

    const { postBook } = require('../handler');

    const response = await postBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);
  });

  it('Fails when updating a book in a library belonging to another user', async () => {
    const libraryId = '73b57d71-4938-45cc-9880-51db8ebf3e7a';
    const id = '2894d16a-78fe-4dfc-a2b0-0a080898a490';
    const updateBook = {
      id,
      title: 'new book updated',
      libraryId,
      description: 'new description updated',
      thumbnail: '',
      authors: ['author1', 'author2'],
      tags: [],
      isbn10: '',
      isbn13: '',
    };
    const event = newMockEvent('user1', updateBook);

    const { postBook } = require('../handler');

    const response = await postBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);
  });
});
