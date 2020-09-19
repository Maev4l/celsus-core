import * as LibraryManager from './lib/library-manager';
import * as BookManager from './lib/book-manager';
import loggerFactory from './lib/logger';
import dispatch from './lib/dispatcher';

const logger = loggerFactory.getLogger('api');

export const getLibraries = async (event) => {
  try {
    const { userId } = event;

    const result = await LibraryManager.getLibraries(userId);
    return result;
  } catch (e) {
    logger.error(`Error getLibraries: ${e.message}`);
    throw e;
  }
};

export const getLibrary = async (event) => {
  try {
    const { userId, payload } = event;
    const { id: libraryId } = payload;
    const result = await LibraryManager.getLibrary(userId, libraryId);
    return result;
  } catch (e) {
    logger.error(`Error getLibrary: ${e.message}`);
    throw e;
  }
};

export const postLibrary = async (event) => {
  try {
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
  } catch (e) {
    logger.error(`Error postLibrary: ${e.message}`);
    throw e;
  }
};

export const deleteLibrary = async (event) => {
  try {
    const { userId, payload } = event;
    const { id: libraryId } = payload;

    const deleted = await LibraryManager.deleteLibrary(userId, libraryId);

    return deleted;
  } catch (e) {
    logger.error(`Error deleteLibrary: ${e.message}`);
    throw e;
  }
};

export const getBook = async (event) => {
  try {
    const { userId, payload } = event;
    const { id: bookId } = payload;
    const result = await BookManager.getBook(userId, bookId);
    return result;
  } catch (e) {
    logger.error(`Error getBook: ${e.message}`);
    throw e;
  }
};

export const getBooksFromLibrary = async (event) => {
  try {
    const { userId, payload } = event;
    const { libraryId, page, pageSize } = payload;
    const offset = page - 1;
    const result = await BookManager.getBooksFromLibrary(userId, libraryId, offset, pageSize);
    return result;
  } catch (e) {
    logger.error(`Error getBooksFromLibrary: ${e.message}`);
    throw e;
  }
};

export const searchBooks = async (event) => {
  try {
    const { userId, payload } = event;
    const { page, keywords, pageSize } = payload;
    const offset = page - 1;
    const result = await BookManager.searchBooks(userId, offset, keywords, pageSize);
    return result;
  } catch (e) {
    logger.error(`Error searchBooks: ${e.message}`);
    throw e;
  }
};

export const deleteBook = async (event) => {
  try {
    const { userId, payload } = event;
    const { id: bookId } = payload;

    const deleted = await BookManager.deleteBook(userId, bookId);

    return deleted;
  } catch (e) {
    logger.error(`Error deleteBook: ${e.message}`);
    throw e;
  }
};

export const postBook = async (event) => {
  try {
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
  } catch (e) {
    logger.error(`Error postBook: ${e.message}`);
    throw e;
  }
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
