import { assert } from 'chai';
import dotenv from 'dotenv';

import { searchBooks, getBooksFromLibrary } from '../src/handler';
import { makeMockEvent } from './utils';

dotenv.config();

const { MAX_BOOKS_PAGE_SIZE } = require('../src/lib/book-manager');

describe('Books Tests (READ - SEARCH)', async () => {
  it('Returns list of books from a given library', async () => {
    const event = makeMockEvent('user14', { libraryId: '104', page: 1, pageSize: 10 });

    const { books, itemsPerPage, total } = await getBooksFromLibrary(event);
    assert.strictEqual(1, books.length);

    const [book] = books;

    const { id } = book;
    assert.equal(id, '106');
    assert.equal(itemsPerPage, 10);
    assert.equal(total, 1);
  });

  it('Returns list of books from a given library when requested page size exceeds hard limit', async () => {
    const event = makeMockEvent('user14', { libraryId: '104', page: 1, pageSize: 200 });

    const { books, itemsPerPage, total } = await getBooksFromLibrary(event);
    assert.strictEqual(1, books.length);

    const [book] = books;

    const { id } = book;
    assert.equal(id, '106');
    assert.equal(itemsPerPage, MAX_BOOKS_PAGE_SIZE);
    assert.equal(total, 1);
  });

  it('Returns list of books with a search simple criteria based on author', async () => {
    const expected = {
      itemsPerPage: MAX_BOOKS_PAGE_SIZE,
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

    const event = makeMockEvent('user10', { page: 1, keywords: ['pagnol'] });
    const result = await searchBooks(event);

    assert.deepEqual(result, expected);
  });

  it('Returns list of books with a search simple criteria based on author  when requested page size exceeds hard limit', async () => {
    const expected = {
      itemsPerPage: MAX_BOOKS_PAGE_SIZE,
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

    const event = makeMockEvent('user10', { page: 1, pageSize: 200, keywords: ['pagnol'] });
    const result = await searchBooks(event);

    assert.deepEqual(result, expected);
  });

  it('Returns list of books with a search simple criteria based on title', async () => {
    const expected = {
      itemsPerPage: MAX_BOOKS_PAGE_SIZE,
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

    const event = makeMockEvent('user10', { page: 1, keywords: ['mère'] });
    const result = await searchBooks(event);
    assert.deepEqual(result, expected);
  });

  it('Returns list of books with a search multi words criteria based on title', async () => {
    const expected = {
      itemsPerPage: MAX_BOOKS_PAGE_SIZE,
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

    const event = makeMockEvent('user10', { page: 1, keywords: ['mère', 'chateau'] });
    const result = await searchBooks(event);
    assert.deepEqual(result, expected);
  });
});
