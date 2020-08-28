import { assert } from 'chai';
import dotenv from 'dotenv';

import { getBooks, getBooksFromLibrary } from '../src/handler';
import { newMockEvent, makeMockEvent } from './utils';

dotenv.config();

const { BOOKS_PAGE_SIZE } = require('../src/lib/book-manager');

describe('Books Tests (READ - SEARCH)', async () => {
  it('Returns list of books belonging to user4 without a defined offset', async () => {
    const expected = {
      itemsPerPage: BOOKS_PAGE_SIZE,
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
          language: 'fr',
          bookSet: 'book set 1',
          bookSetOrder: 0,
          lendingId: null,
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
          language: 'fr',
          bookSet: 'book set 2',
          bookSetOrder: 0,
          lendingId: null,
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

  it('Returns list of books from a given library', async () => {
    const event = makeMockEvent('user14', { libraryId: '104' });

    const { books } = await getBooksFromLibrary(event);
    assert.strictEqual(1, books.length);

    const [book] = books;

    const { id } = book;
    assert.equal(id, 106);
  });

  it('Returns list of books belonging to user4 with a defined offset to 1', async () => {
    const expected = {
      itemsPerPage: BOOKS_PAGE_SIZE,
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

  it('Returns list of books with a search simple criteria based on author', async () => {
    const expected = {
      itemsPerPage: BOOKS_PAGE_SIZE,
      total: 2,
      books: [
        {
          authors: ['Marcel Pagnol'],
          description:
            "Je suis né dans la ville d'Aubagne, sous le Garlaban couronné de chèvres, au temps des derniers chevriers ",
          id: '8fe9470f-4daf-4559-b903-af9a9937ed72',
          isbn10: 'Book isbn10',
          isbn13: 'Book isbn13',
          language: 'fr',
          library: {
            id: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
            name: 'My Library Name',
          },
          tags: ['Book tags'],
          thumbnail: '',
          title: 'La gloire de ma mère',
          bookSet: 'Set1',
          bookSetOrder: 1,
          lendingId: null,
        },
        {
          authors: ['Marcel Pagnol'],
          description:
            'Ce deuxième tome est dans le prolongement chronologique de La Gloire de mon père',
          id: 'd6f7359c-8f2b-428b-a295-806069e60a3f',
          isbn10: 'Book isbn10',
          isbn13: 'Book isbn13',
          language: 'fr',
          library: {
            id: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
            name: 'My Library Name',
          },
          tags: ['Book tags'],
          thumbnail: '',
          title: 'Le château de ma mère',
          bookSet: 'Set1',
          bookSetOrder: 2,
          lendingId: null,
        },
      ],
    };

    const event = newMockEvent('user10', null, null, { offset: 0, q: 'pagnol' });
    const response = await getBooks(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 200);
    const result = JSON.parse(body);
    assert.deepEqual(result, expected);
  });

  it('Returns list of books with a search simple criteria based on title', async () => {
    const expected = {
      itemsPerPage: BOOKS_PAGE_SIZE,
      total: 2,
      books: [
        {
          authors: ['Marcel Pagnol'],
          description:
            "Je suis né dans la ville d'Aubagne, sous le Garlaban couronné de chèvres, au temps des derniers chevriers ",
          id: '8fe9470f-4daf-4559-b903-af9a9937ed72',
          isbn10: 'Book isbn10',
          isbn13: 'Book isbn13',
          language: 'fr',
          library: {
            id: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
            name: 'My Library Name',
          },
          tags: ['Book tags'],
          thumbnail: '',
          title: 'La gloire de ma mère',
          bookSet: 'Set1',
          bookSetOrder: 1,
          lendingId: null,
        },
        {
          authors: ['Marcel Pagnol'],
          description:
            'Ce deuxième tome est dans le prolongement chronologique de La Gloire de mon père',
          id: 'd6f7359c-8f2b-428b-a295-806069e60a3f',
          isbn10: 'Book isbn10',
          isbn13: 'Book isbn13',
          language: 'fr',
          library: {
            id: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
            name: 'My Library Name',
          },
          tags: ['Book tags'],
          thumbnail: '',
          title: 'Le château de ma mère',
          bookSet: 'Set1',
          bookSetOrder: 2,
          lendingId: null,
        },
      ],
    };

    const event = newMockEvent('user10', null, null, { offset: 0, q: 'mère' });
    const response = await getBooks(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 200);
    const result = JSON.parse(body);
    assert.deepEqual(result, expected);
  });

  it('Returns list of books with a search multi words criteria based on title', async () => {
    const expected = {
      itemsPerPage: BOOKS_PAGE_SIZE,
      total: 1,
      books: [
        {
          authors: ['Marcel Pagnol'],
          description:
            'Ce deuxième tome est dans le prolongement chronologique de La Gloire de mon père',
          id: 'd6f7359c-8f2b-428b-a295-806069e60a3f',
          isbn10: 'Book isbn10',
          isbn13: 'Book isbn13',
          language: 'fr',
          library: {
            id: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
            name: 'My Library Name',
          },
          tags: ['Book tags'],
          thumbnail: '',
          title: 'Le château de ma mère',
          bookSet: 'Set1',
          bookSetOrder: 2,
          lendingId: null,
        },
      ],
    };

    const event = newMockEvent('user10', null, null, { offset: 0, q: 'mère chateau' });
    const response = await getBooks(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 200);
    const result = JSON.parse(body);
    assert.deepEqual(result, expected);
  });
});
