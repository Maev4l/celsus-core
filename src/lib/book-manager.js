import uuidv4 from 'uuid/v4';
import Joi from 'joi';

import { bookSchema as schema } from './schemas';
import CelsusException from './exception';
import { hashBook, LEND_BOOK_VALIDATION_STATUS } from './utils';
import { fromPGLanguage, listBooks, removeBook, saveBook, modifyBook } from './storage';
import { replyBookValidation } from './messaging';

export const BOOKS_PAGE_SIZE = 5;

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
    books: rows.map(row => {
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

export const validateBook = async (userId, bookId, lendId, replyAddress) => {
  // - Ensure the book exists (and belongs to the given user)
  // - Ensure the book is not already lent (or in lending process)
  const status = LEND_BOOK_VALIDATION_STATUS.BOOK_VALIDATED;
  await replyBookValidation(lendId, bookId, status, replyAddress);
};
