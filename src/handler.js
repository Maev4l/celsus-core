import * as LibraryManager from './lib/library-manager';
import * as BookManager from './lib/book-manager';
import loggerFactory from './lib/logger';
import dispatch from './lib/dispatcher';

const logger = loggerFactory.getLogger('api');

const makeResponse = (statusCode, result) => {
  let body = '';
  if (result) {
    body = JSON.stringify(result);
  }
  const response = {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body,
  };

  return response;
};

export const getLibraries = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;

  const result = await LibraryManager.getLibraries(sub);
  return makeResponse(200, result);
};

export const postLibrary = async (event) => {
  const library = JSON.parse(event.body);
  const { sub } = event.requestContext.authorizer.claims;
  let result = '';
  let statusCode;

  // If a library does not have an existing id, it means we are trying to create it
  try {
    if (!library.id) {
      result = await LibraryManager.createLibrary(sub, library);
      statusCode = 201;
    } else {
      const updated = await LibraryManager.updateLibrary(sub, library);
      if (updated) {
        statusCode = 204;
      } else {
        statusCode = 400;
      }
    }
  } catch (e) {
    statusCode = 400;
    const { message } = e;
    result = { message };
  }
  return makeResponse(statusCode, result);
};

export const deleteLibrary = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;

  const libraryId = event.pathParameters.id;
  const result = await LibraryManager.deleteLibrary(sub, libraryId);
  const statusCode = result ? 204 : 404;

  return makeResponse(statusCode);
};

export const getLibrary = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;

  const libraryId = event.pathParameters.id;
  let statusCode;
  let result = null;
  try {
    result = await LibraryManager.getLibrary(sub, libraryId);
    statusCode = result ? 200 : 404;
  } catch (e) {
    statusCode = 500;
  }

  return makeResponse(statusCode, result);
};

export const getBooks = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;
  const { queryStringParameters } = event;
  const offset = queryStringParameters ? queryStringParameters.offset || 0 : 0;
  const searchQuery = queryStringParameters ? queryStringParameters.q || '' : '';

  const result = await BookManager.getBooks(sub, offset, searchQuery);
  return makeResponse(200, result);
};

export const deleteBook = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;

  const bookId = event.pathParameters.id;
  const book = await BookManager.getBook(sub, bookId);
  if (book) {
    const result = await BookManager.deleteBook(sub, bookId);
    const statusCode = result ? 204 : 400;

    return makeResponse(statusCode);
  }

  return makeResponse(404);
};

export const postBook = async (event) => {
  const book = JSON.parse(event.body);
  const { sub } = event.requestContext.authorizer.claims;
  let result = '';
  let statusCode;

  // If a book does not have an existing id, it means we are trying to create it
  if (!book.id) {
    try {
      result = await BookManager.createBook(sub, book);
      statusCode = 201;
    } catch (e) {
      statusCode = 400;
      const { message } = e;
      result = { message };
    }
  } else {
    try {
      const updated = await BookManager.updateBook(sub, book);
      if (updated) {
        statusCode = 204;
      } else {
        statusCode = 400;
      }
    } catch (e) {
      statusCode = 400;
      const { message } = e;
      result = { message };
    }
  }
  return makeResponse(statusCode, result);
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
