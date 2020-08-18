import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

import { bookSchema as schema } from './schemas';
import CelsusException from './exception';
import { hashBook, LEND_BOOK_VALIDATION_STATUS } from './utils';
import {
  fromPGLanguage,
  listBooks,
  removeBook,
  saveBook,
  modifyBook,
  readBook,
  transitionBookToLendingPending,
  transitionBookToNotLent,
  transitionBookToLendingConfirmed,
} from './storage';
import messaging from './messaging';

export const BOOKS_PAGE_SIZE = 5;

export const getBook = async (userId, bookId) => {
  const row = await readBook(userId, bookId);
  return row;
};

/**
 * Retrieve list of books belonging to a given user
 * @param {string} userId Incognito id of the user
 * @param {string} offset offset is zero-based
 * @param {string} searchQuery Search query
 */
export const getBooks = async (userId, offset, searchQuery) => {
  const { rows, rowCount } = await listBooks(userId, offset, BOOKS_PAGE_SIZE, searchQuery);
  return {
    itemsPerPage: BOOKS_PAGE_SIZE,
    total: parseInt(rowCount, 10),
    books: rows.map((row) => {
      const {
        id,
        libraryId,
        libraryName,
        title,
        description,
        isbn10,
        isbn13,
        thumbnail,
        authors,
        tags,
        language,
        bookSet,
        bookSetOrder,
        lendingId,
      } = row;
      return {
        id,
        title,
        description,
        library: {
          id: libraryId,
          name: libraryName,
        },
        isbn10,
        isbn13,
        thumbnail,
        authors,
        tags,
        language: fromPGLanguage(language),
        bookSet,
        bookSetOrder,
        lendingId,
      };
    }),
  };
};

export const deleteBook = async (userId, bookId) => {
  const rowCount = await removeBook(userId, bookId);
  return rowCount === 1;
};

export const createBook = async (userId, book) => {
  const { error } = Joi.validate(book, schema);
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
  const { error } = Joi.validate(book, schema);
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
