import { v4 as uuidv4 } from 'uuid';

import { bookSchema as schema } from './schemas';
import CelsusException from './exception';
import { hashBook, LEND_BOOK_VALIDATION_STATUS } from './utils';
import {
  fromPGLanguage,
  filterBooksFromKeywords,
  listBooksFromLibrary,
  removeBook,
  saveBook,
  modifyBook,
  readBook,
  transitionBookToLendingPending,
  transitionBookToNotLent,
  transitionBookToLendingConfirmed,
  listBookSetsFromLibrary,
} from './storage';
import messaging from './messaging';

export const MAX_BOOKS_PAGE_SIZE = 50;

export const getBook = async (userId, bookId) => {
  const row = await readBook(userId, bookId);
  if (row) {
    const { language } = row;

    return { ...row, language: fromPGLanguage(language) };
  }

  return row;
};

export const getBooksFromLibrary = async (
  userId,
  libraryId,
  offset,
  pageSize = MAX_BOOKS_PAGE_SIZE,
) => {
  const effectivePageSize = pageSize > MAX_BOOKS_PAGE_SIZE ? MAX_BOOKS_PAGE_SIZE : pageSize;

  const { rows, rowCount } = await listBooksFromLibrary(
    userId,
    libraryId,
    offset,
    effectivePageSize,
  );
  return {
    itemsPerPage: effectivePageSize,
    total: parseInt(rowCount, 10),
    books: rows.map((row) => {
      const { language } = row;
      return {
        ...row,
        language: fromPGLanguage(language),
      };
    }),
  };
};

export const getBookSetsFromLibrary = async (userId, libraryId) => {
  const rows = await listBookSetsFromLibrary(userId, libraryId);
  /**
   * {
   *    bookSets: [
   *      {
   *        name: 'bookset'1,
   *        books: [
   *        ]
   *      }
   *    ]
   * }
   */
  const map = new Map();
  rows.forEach((row) => {
    const { bookSet } = row;
    const collection = map.get(bookSet);
    if (!collection) {
      map.set(bookSet, [row]);
    } else {
      collection.push(row);
    }
  });

  const bookSets = [];
  map.forEach((v, k) => {
    bookSets.push({ name: k, books: v });
  });

  bookSets.sort((b1, b2) => b1.name.localeCompare(b2.name));
  return { bookSets };
};

/**
 * Retrieve list of books belonging to a given user
 * @param {string} userId Incognito id of the user
 * @param {string} offset offset is zero-based
 * @param {string} keywords keywords to match
 */
export const searchBooks = async (userId, offset, keywords, pageSize = MAX_BOOKS_PAGE_SIZE) => {
  const effectivePageSize = pageSize > MAX_BOOKS_PAGE_SIZE ? MAX_BOOKS_PAGE_SIZE : pageSize;
  const { rows, rowCount } = await filterBooksFromKeywords(
    userId,
    offset,
    effectivePageSize,
    keywords,
  );
  return {
    itemsPerPage: effectivePageSize,
    total: parseInt(rowCount, 10),
    books: rows.map((row) => {
      const { language } = row;
      return {
        ...row,
        language: fromPGLanguage(language),
      };
    }),
  };
};

export const deleteBook = async (userId, bookId) => {
  const rowCount = await removeBook(userId, bookId);
  return rowCount === 1;
};

export const createBook = async (userId, book) => {
  const { error } = schema.validate(book);
  if (error) {
    const { message } = error.details[0];
    throw new CelsusException(message);
  }

  const id = uuidv4();
  const hash = hashBook(book);

  const { libraryId } = book;

  const rowCount = await saveBook(userId, {
    ...book,
    id,
    hash,
  });
  if (rowCount === 0) {
    throw new CelsusException(`Library (id: ${libraryId}) does not exists`);
  }

  return { id };
};

export const updateBook = async (userId, book) => {
  const { error } = schema.validate(book);
  if (error) {
    const { message } = error.details[0];
    throw new CelsusException(message);
  }
  const { libraryId } = book;
  const hash = hashBook(book);
  const rowCount = await modifyBook(userId, { ...book, hash });
  if (rowCount === 0) {
    throw new CelsusException(`Library (id: ${libraryId}) does not exists`);
  }
  return rowCount === 1;
};

export const validateBook = async (userId, bookId, lendingId, replyAddress) => {
  // - Ensure the book exists (and belongs to the given user)
  // - Ensure the book is not already lent (or in lending process)
  const result = await transitionBookToLendingPending(userId, bookId);

  const validationResult = {
    status: result
      ? LEND_BOOK_VALIDATION_STATUS.BOOK_VALIDATED
      : LEND_BOOK_VALIDATION_STATUS.BOOK_NOT_VALIDATED,
    title: result ? result.title : null,
  };
  await messaging.replyBookValidation(userId, bookId, lendingId, validationResult, replyAddress);
};

export const cancelLendBook = async (userId, bookId) => {
  // - Update lending information accordingly
  await transitionBookToNotLent(userId, bookId);
};

export const confirmLendBook = async (userId, bookId, lendingId) => {
  // - Update lending information accordingly
  await transitionBookToLendingConfirmed(userId, bookId, lendingId);
};

export const returnLentBook = async (userId, bookId) => {
  // - Update lending information accordingly
  await transitionBookToNotLent(userId, bookId);
};
