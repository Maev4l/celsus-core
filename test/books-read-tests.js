import { assert } from 'chai';

import { searchBooks, getBooksFromLibrary, getBook, getBookSetsFromLibrary } from '../src/handler';
import { makeMockEvent } from './utils';

const { MAX_BOOKS_PAGE_SIZE } = require('../src/lib/book-manager');

describe('Books Tests (READ - SEARCH)', async () => {
  it('Returns a single book without thumbnail', async () => {
    const event = makeMockEvent('user15', { id: '107' });

    const { id, title, thumbnail } = await getBook(event);

    assert.equal(id, '107');
    assert.equal(title, 'Book107');
    assert.isNull(thumbnail);
  });

  it('Returns a single book with thumbnail', async () => {
    const event = makeMockEvent('user15', { id: '113' });

    const { id, title, thumbnail } = await getBook(event);

    assert.equal(id, '113');
    assert.equal(title, 'Book113');
    assert.equal(thumbnail, 'ZDp2LDosdmN4OixieGJ2O3hjdmZ2bmZqdmZibg==');
  });

  it('Fails with an unknown book', async () => {
    const event = makeMockEvent('999', { id: '999' });

    const result = await getBook(event);

    assert.isNull(result);
  });

  it('Returns list of books from a given library', async () => {
    const event = makeMockEvent('user14', { libraryId: '104', page: 1, pageSize: 10 });

    const { books, itemsPerPage, total } = await getBooksFromLibrary(event);
    assert.strictEqual(books.length, 2);

    const [book1, book2] = books;

    const { id: id1, thumbnail: thumbnail1 } = book1;
    const { id: id2, thumbnail: thumbnail2 } = book2;
    assert.equal(id1, '106');
    assert.isNull(thumbnail1);
    assert.equal(id2, '114');
    assert.equal(thumbnail2, 'S2Fib29tIQ==');
    assert.equal(itemsPerPage, 10);
    assert.equal(total, 2);
  });

  it('Returns list of books from a given library when requested page size exceeds hard limit', async () => {
    const event = makeMockEvent('user14', { libraryId: '104', page: 1, pageSize: 200 });

    const { books, itemsPerPage, total } = await getBooksFromLibrary(event);
    assert.strictEqual(books.length, 2);

    const [book1, book2] = books;

    const { id: id1, thumbnail: thumbnail1 } = book1;
    const { id: id2, thumbnail: thumbnail2 } = book2;
    assert.equal(id1, '106');
    assert.isNull(thumbnail1);
    assert.equal(id2, '114');
    assert.equal(thumbnail2, 'S2Fib29tIQ==');
    assert.equal(itemsPerPage, MAX_BOOKS_PAGE_SIZE);
    assert.equal(total, 2);
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
          libraryId: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
          libraryName: 'My Library Name',
          tags: ['Book tags'],
          thumbnail: null,
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
          libraryId: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
          libraryName: 'My Library Name',
          tags: ['Book tags'],
          thumbnail: 'UGFnbm9s',
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
          libraryId: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
          libraryName: 'My Library Name',
          tags: ['Book tags'],
          thumbnail: null,
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
          libraryId: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
          libraryName: 'My Library Name',
          tags: ['Book tags'],
          thumbnail: 'UGFnbm9s',
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
          libraryId: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
          libraryName: 'My Library Name',
          tags: ['Book tags'],
          thumbnail: null,
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
          libraryId: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
          libraryName: 'My Library Name',
          tags: ['Book tags'],
          thumbnail: 'UGFnbm9s',
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
          libraryId: '4ba98133-ebd1-4fed-b7b2-920745b9c429',
          libraryName: 'My Library Name',
          tags: ['Book tags'],
          thumbnail: 'UGFnbm9s',
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

  it('Returns list of booksets from a given library', async () => {
    const event = makeMockEvent('user16', { libraryId: '107' });

    const result = await getBookSetsFromLibrary(event);
    const { bookSets } = result;

    assert.strictEqual(2, bookSets.length);

    const [bookSet1, bookSet2] = bookSets;
    const { books: booksList1, name: name1 } = bookSet1;
    assert.strictEqual(2, booksList1.length);
    assert.equal(name1, 'Set1');
    const [book11, book12] = booksList1;
    assert.equal(book11.id, '108');
    assert.equal(book11.title, 'Book108');
    assert.equal(book11.libraryId, '107');
    assert.equal(book12.id, '109');
    assert.equal(book12.title, 'Book109');
    assert.equal(book12.libraryId, '107');

    const { books: booksList2, name: name2 } = bookSet2;
    assert.strictEqual(1, booksList2.length);
    assert.equal(name2, 'Set2');
    const [book21] = booksList2;
    assert.equal(book21.id, '110');
    assert.equal(book21.title, 'Book110');
    assert.equal(book21.libraryId, '107');
    assert.equal(book21.thumbnail, 'Vm9ybG9u');
  });
});
