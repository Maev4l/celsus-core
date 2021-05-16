import { assert } from 'chai';
import dotenv from 'dotenv';

import { postBook } from '../src/handler';
import { makeMockEvent } from './utils';
import { fromPGLanguage, getDatabase } from '../src/lib/database';
import { hashBook } from '../src/lib/utils';

dotenv.config();

const schemaName = process.env.PGSCHEMA;
const database = getDatabase();

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
      language: 'gb',
      bookSet: 'my book set',
      bookSetOrder: 1,
    };
    const event = makeMockEvent('user6', { book: newBook });

    const { id } = await postBook(event);
    assert.exists(id);
    assert.notEqual(id, '');

    const rowsBooks = await database.any(`SELECT * FROM "${schemaName}"."book" WHERE "id"=$1;`, [
      id,
    ]);
    assert.strictEqual(rowsBooks.length, 1);
    const expectedBook = rowsBooks[0];

    assert.strictEqual(libraryId, expectedBook.library_id);
    assert.strictEqual(newBook.title, expectedBook.title);
    assert.strictEqual(newBook.description, expectedBook.description);
    assert.deepEqual(newBook.authors, expectedBook.authors);
    assert.deepEqual(newBook.tags, expectedBook.tags);
    assert.strictEqual(hashBook(newBook), expectedBook.hash);
    assert.strictEqual(newBook.language, fromPGLanguage(expectedBook.language));
    assert.strictEqual(newBook.bookSet, expectedBook.book_set);

    const rowsSearch = await database.any(
      `SELECT * FROM "${schemaName}"."books_search" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rowsSearch.length, 1);

    await database.none(`DELETE FROM "${schemaName}"."book" WHERE "id"=$1`, [id]);
  });

  it('Fails when adding a book to an unknown library', async () => {
    const libraryId = 'd94b1931-397b-4988-931f-f42ac1604577';
    const newBook = {
      title: 'new book',
      libraryId,
      description: 'new description',
      thumbnail: '',
      authors: ['author1', 'author2'],
      tags: ['tag1', 'tag2'],
      isbn10: '',
      language: 'gb',
      bookSet: '',
      bookSetOrder: 0,
      isbn13: '',
    };
    const event = makeMockEvent('user1', { book: newBook });

    let thrown = false;
    try {
      await postBook(event);
    } catch (e) {
      thrown = true;
    }

    assert.isTrue(thrown);
  });

  it('Fails when adding a book with bookset and no set order', async () => {
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
      language: 'gb',
      bookSet: 'my book set',
      bookSetOrder: 0,
    };
    const event = makeMockEvent('user6', { book: newBook });
    let thrown = false;
    try {
      await postBook(event);
    } catch (e) {
      thrown = true;
    }

    assert.isTrue(thrown);
  });

  it('Fails when adding a book with no bookset and a set order', async () => {
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
      language: 'gb',
      bookSet: '',
      bookSetOrder: 1,
    };
    const event = makeMockEvent('user6', { book: newBook });

    let thrown = false;
    try {
      await postBook(event);
    } catch (e) {
      thrown = true;
    }

    assert.isTrue(thrown);
  });

  it('Fails when adding a book to a library belonging to another user', async () => {
    const libraryId = '73b57d71-4938-45cc-9880-51db8ebf3e7a';
    const newBook = {
      title: 'new book',
      libraryId,
      description: 'new description',
      thumbnail: '',
      authors: ['author1', 'author2'],
      tags: ['tag1', 'tag2'],
      isbn10: '',
      isbn13: '',
      language: 'gb',
      bookSet: '',
      bookSetOrder: 0,
    };
    const event = makeMockEvent('user6', { book: newBook });

    let thrown = false;
    try {
      await postBook(event);
    } catch (e) {
      thrown = true;
    }

    assert.isTrue(thrown);
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
      language: 'gb',
      bookSet: 'my book set',
      bookSetOrder: 2,
    };
    const event = makeMockEvent('user7', { book: updateBook });

    const updated = await postBook(event);

    assert.isTrue(updated);

    const rowsBooks = await database.any(`SELECT * FROM "${schemaName}"."book" WHERE "id"=$1;`, [
      id,
    ]);
    assert.strictEqual(rowsBooks.length, 1);
    const expectedBook = rowsBooks[0];

    assert.strictEqual(expectedBook.library_id, libraryId);
    assert.strictEqual(expectedBook.title, updateBook.title);
    assert.strictEqual(expectedBook.description, updateBook.description);
    assert.deepEqual(expectedBook.authors, updateBook.authors);
    assert.deepEqual(expectedBook.tags, updateBook.tags);
    assert.strictEqual(expectedBook.hash, hashBook(updateBook));
    assert.strictEqual(fromPGLanguage(expectedBook.language), updateBook.language);
    assert.strictEqual(expectedBook.book_set, updateBook.bookSet);

    const rowsSearch = await database.any(
      `SELECT * FROM "${schemaName}"."books_search" WHERE "id"=$1;`,
      [id],
    );
    assert.strictEqual(rowsSearch.length, 1);
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
    const event = makeMockEvent('user7', { book: updateBook });

    let thrown = false;
    try {
      await postBook(event);
    } catch (e) {
      thrown = true;
    }

    assert.isTrue(thrown);
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
    const event = makeMockEvent('user7', { book: updateBook });

    let thrown = false;
    try {
      await postBook(event);
    } catch (e) {
      thrown = true;
    }

    assert.isTrue(thrown);
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
    const event = makeMockEvent('user1', { book: updateBook });

    let thrown = false;
    try {
      await postBook(event);
    } catch (e) {
      thrown = true;
    }

    assert.isTrue(thrown);
  });
});
