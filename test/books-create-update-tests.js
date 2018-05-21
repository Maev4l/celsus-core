const { assert } = require('chai');
const { Pool } = require('pg');
require('dotenv').config();
const Utils = require('../lib/utils');

const {
  postBook,
} = require('../handler');
const { newMockEvent } = require('./utils');

const images = require('./images.json');

describe('Books Tests (CREATE - UPDATE)', async () => {
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
    assert.isNotEmpty(expectedBook.hash);

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
    const event = newMockEvent(
      'user7',
      updateBook,
    );

    const response = await postBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 204);

    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT * FROM "celsus"."book" WHERE "id"=$1;', [id]);
    assert.strictEqual(rows.length, 1);
    const expectedBook = rows[0];

    assert.strictEqual(expectedBook.library_id, libraryId);
    assert.strictEqual(expectedBook.title, updateBook.title);
    assert.strictEqual(expectedBook.description, updateBook.description);
    assert.strictEqual(expectedBook.authors, updateBook.authors.join(';'));
    assert.strictEqual(expectedBook.tags, updateBook.tags.join(';'));
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
    const event = newMockEvent(
      'user7',
      updateBook,
    );

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
    const event = newMockEvent(
      'user7',
      updateBook,
    );

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
    const event = newMockEvent(
      'user1',
      updateBook,
    );

    const response = await postBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 400);
  });

  it('Adds a new book for user8 with thumbnail', async () => {
    const libraryId = 'e0d7422f-ca44-4dac-bb56-51fe67cc3809';

    const thumbnail = images.image1;

    const newBook = {
      title: 'new book',
      libraryId,
      description: 'new description',
      thumbnail,
      authors: ['author1', 'author2'],
      tags: [],
      isbn10: '',
      isbn13: '',
    };
    const event = newMockEvent(
      'user8',
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
    const { rows } = await client.query('SELECT thumbnail FROM "celsus"."book" WHERE "id"=$1;', [result.id]);
    assert.strictEqual(rows.length, 1);
    const expectedBook = rows[0];
    assert.notStrictEqual(expectedBook.thumbnail, thumbnail);
    assert.notStrictEqual(expectedBook.thumbnail, '');

    await client.query('DELETE FROM "celsus"."book" WHERE "id"=$1', [result.id]);
    client.release();
    await pool.end();
  });

  it('Updates an existing book for user9 with new thumbnail', async () => {
    const libraryId = '979ed879-b3c0-40fa-83ff-5f4442052217';
    const id = '341e5d68-4682-4b91-9058-200a60d4ad75';

    const thumbnail = images.image2;

    const updateBook = {
      id,
      title: 'new book',
      libraryId,
      description: 'new description',
      thumbnail,
      authors: ['author1', 'author2'],
      tags: [],
      isbn10: '',
      isbn13: '',
    };
    const event = newMockEvent(
      'user9',
      updateBook,
    );

    const response = await postBook(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 204);

    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query('SELECT thumbnail FROM "celsus"."book" WHERE "id"=$1;', [id]);
    assert.strictEqual(rows.length, 1);
    const expectedBook = rows[0];
    assert.notStrictEqual(expectedBook.thumbnail, '');
    assert.notStrictEqual(expectedBook.thumbnail, thumbnail);

    client.release();
    await pool.end();
  });
});
