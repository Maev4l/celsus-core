const { assert } = require('chai');
const { Pool } = require('pg');
require('dotenv').config();

const {
  postBook,
} = require('../handler');
const { newMockEvent } = require('./utils');

describe('Books Tests (CREATE - UPDATE)', async () => {
  it('Adds a new book for user1 in library id=1', async () => {
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
    const event = newMockEvent(
      'user6',
      newBook,
    );

    const response = await postBook(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 201);
    const result = JSON.parse(body);
    assert.exists(result.id);
    assert.notEqual(result.id, '');

    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT * FROM "celsus"."book" WHERE "id"=$1;', [result.id]);
    assert.strictEqual(rows.length, 1);
    const expectedBook = rows[0];

    assert.strictEqual(expectedBook.library_id, libraryId);
    assert.strictEqual(expectedBook.title, newBook.title);
    assert.strictEqual(expectedBook.description, newBook.description);
    assert.strictEqual(expectedBook.authors, newBook.authors.join(';'));
    assert.strictEqual(expectedBook.tags, newBook.tags.join(';'));

    await client.query('DELETE FROM "celsus"."book" WHERE "id"=$1', [result.id]);
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
    const event = newMockEvent(
      'user1',
      newBook,
    );

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
    const event = newMockEvent(
      'user6',
      newBook,
    );

    const response = await postBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);
  });
});
