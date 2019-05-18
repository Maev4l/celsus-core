import * as LibraryManager from './lib/library-manager';
import * as BookManager from './lib/book-manager';

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

export const getLibraries = async event => {
  const { sub } = event.requestContext.authorizer.claims;
  const result = await LibraryManager.getLibraries(sub);
  return makeResponse(200, result);
};

export const postLibrary = async event => {
  const library = JSON.parse(event.body);
  const { sub } = event.requestContext.authorizer.claims;
  let result = '';
  let statusCode;

  // If a library does not have an existing id, it means we are trying to create it
  if (!library.id) {
    try {
      result = await LibraryManager.createLibrary(sub, library);
      statusCode = 201;
    } catch (e) {
      statusCode = 400;
      const { message } = e;
      result = { message };
    }
  } else {
    const updated = await LibraryManager.updateLibrary(sub, library);
    if (updated) {
      statusCode = 204;
    } else {
      statusCode = 400;
    }
  }
  return makeResponse(statusCode, result);
};

export const deleteLibrary = async event => {
  const { sub } = event.requestContext.authorizer.claims;

  const libraryId = event.pathParameters.id;
  const result = await LibraryManager.deleteLibrary(sub, libraryId);
  const statusCode = result ? 204 : 404;

  return makeResponse(statusCode);
};

export const getLibrary = async event => {
  const { sub } = event.requestContext.authorizer.claims;

  const libraryId = event.pathParameters.id;
  const result = await LibraryManager.getLibrary(sub, libraryId);
  let statusCode;
  if (result.length === 1) {
    statusCode = 200;
  } else if (result.length === 0) {
    statusCode = 404;
  } else {
    // We have several libraries with the same identifiers
    statusCode = 500;
  }

  return makeResponse(statusCode, result.length === 1 ? result[0] : null);
};

export const getBooks = async event => {
  const { sub } = event.requestContext.authorizer.claims;
  const { queryStringParameters } = event;
  const offset = queryStringParameters ? queryStringParameters.offset || 0 : 0;
  const searchQuery = queryStringParameters ? queryStringParameters.q || '' : '';

  const result = await BookManager.getBooks(sub, offset, searchQuery);
  return makeResponse(200, result);
};

export const deleteBook = async event => {
  const { sub } = event.requestContext.authorizer.claims;

  const bookId = event.pathParameters.id;
  const result = await BookManager.deleteBook(sub, bookId);
  const statusCode = result ? 204 : 404;

  return makeResponse(statusCode);
};

export const postBook = async event => {
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