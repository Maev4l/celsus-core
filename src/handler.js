import * as LibraryManager from './lib/library-manager';
import * as BookManager from './lib/book-manager';
import loggerFactory from './lib/logger';
import dispatch from './lib/dispatcher';

const logger = loggerFactory.getLogger('api');

export const getLibraries = async (event) => {
  const { userId } = event;

  const result = await LibraryManager.getLibraries(userId);
  return result;
};

export const getLibrary = async (event) => {
  const { userId, payload } = event;
  const { id: libraryId } = payload;
  const result = await LibraryManager.getLibrary(userId, libraryId);
  return result;
};

export const postLibrary = async (event) => {
  const { userId, payload } = event;
  const { library } = payload;
  const { id } = library;

  let result;

  // If a library does not have an existing id, it means we are trying to create it
  if (!id) {
    result = await LibraryManager.createLibrary(userId, library);
  } else {
    result = await LibraryManager.updateLibrary(userId, library);
  }

  return result;
};

export const deleteLibrary = async (event) => {
  const { userId, payload } = event;
  const { id: libraryId } = payload;

  const deleted = await LibraryManager.deleteLibrary(userId, libraryId);

  return deleted;
};

export const getBooksFromLibrary = async (event) => {
  const { userId, payload } = event;
  const { libraryId, page } = payload;
  const offset = page - 1;
  const result = await BookManager.getBooksFromLibrary(userId, libraryId, offset);
  return result;
};

export const searchBooks = async (event) => {
  const { userId, payload } = event;
  const { page, keywords } = payload;
  const offset = page - 1;
  const result = await BookManager.searchBooks(userId, offset, keywords);
  return result;
};

export const deleteBook = async (event) => {
  const { userId, payload } = event;
  const { id: bookId } = payload;

  const deleted = await BookManager.deleteBook(userId, bookId);

  return deleted;
};

export const postBook = async (event) => {
  const { userId, payload } = event;
  const { book } = payload;
  const { id } = book;
  let result;
  // If a book does not have an existing id, it means we are trying to create it
  if (!id) {
    result = await BookManager.createBook(userId, book);
  } else {
    result = await BookManager.updateBook(userId, book);
  }

  return result;
};

/**
 * Handle messages from SQS
 * @param {*} event
 */
export const handleMessages = async (event) => {
  const { Records } = event;

  // FIXME: At the current stage, by design, only process 1 event at a time
  const record = Records[0];
  const { messageId, body, messageAttributes } = record;
  let replyAddress = null;

  if (messageAttributes.replyAddress) {
    replyAddress = messageAttributes.replyAddress.stringValue;
  }
  const payload = JSON.parse(body);

  logger.info(`Message received: ${messageId}`);

  const { operation, ...rest } = payload;
  await dispatch(operation, rest, replyAddress);
};
