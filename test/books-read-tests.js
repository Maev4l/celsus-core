const { assert } = require('chai');

require('dotenv').config();

const { getBooks } = require('../handler');
const { newMockEvent } = require('./utils');

const { BooksPerPage } = require('../lib/book-manager');

describe('Books Tests (READ)', async () => {
  it('Returns list of books belonging to user4 without a defined offset', async () => {
    const expected = {
      itemsPerPage: BooksPerPage,
      total: 2,
      books: [
        {
          id: '1',
          library: {
            id: '6',
            name: 'My Library Name',
          },
          title: 'Book Title1',
          description: 'Book Desc',
          isbn10: 'Book isbn10',
          isbn13: 'Book isbn13',
          thumbnail: 'Book thumbnal',
          authors: ['Book authors'],
          tags: ['Book tags'],
        },
        {
          id: '2',
          library: {
            id: '6',
            name: 'My Library Name',
          },
          title: 'Book Title2',
          description: 'Book Desc',
          isbn10: 'Book isbn10',
          isbn13: 'Book isbn13',
          thumbnail: 'Book thumbnal',
          authors: ['Book authors'],
          tags: ['Book tags'],
        },
      ],
    };

    const event = newMockEvent('user4');
    const response = await getBooks(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 200);
    const result = JSON.parse(body);
    assert.strictEqual(2, result.books.length);
    assert.deepEqual(result, expected);
  });

  it('Returns list of books belonging to user4 with a defined offset to 1', async () => {
    const expected = {
      itemsPerPage: BooksPerPage,
      total: 2,
      books: [],
    };

    const event = newMockEvent('user4', null, null, { offset: 1 });
    const response = await getBooks(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 200);
    const result = JSON.parse(body);
    assert.strictEqual(0, result.books.length);
    assert.deepEqual(result, expected);
  });
});
