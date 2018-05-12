const LibraryManager = require('./lib/library-manager');


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

exports.getLibraries = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;
  const manager = new LibraryManager();
  const result = await manager.getLibraries(sub);
  return makeResponse(200, result);
};

exports.postLibrary = async (event) => {
  const library = JSON.parse(event.body);
  const { sub } = event.requestContext.authorizer.claims;
  let result = '';
  let statusCode;

  // If a library does not have an existing id, it means we are trying to create it
  const manager = new LibraryManager();
  if (!library.id) {
    try {
      result = await manager.createLibrary(sub, library);
      statusCode = 201;
    } catch (e) {
      statusCode = 400;
      const { message } = e.details[0];
      result = { message };
    }
  } else {
    const updated = await manager.updateLibrary(sub, library);
    if (updated) {
      statusCode = 204;
    } else {
      statusCode = 400;
    }
  }
  return makeResponse(statusCode, result);
};

exports.deleteLibrary = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;

  const libraryId = event.pathParameters.id;
  const manager = new LibraryManager();
  const result = await manager.deleteLibrary(sub, libraryId);
  const statusCode = result ? 204 : 404;

  return makeResponse(statusCode);
};

exports.getLibrary = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;

  const libraryId = event.pathParameters.id;
  const manager = new LibraryManager();
  const result = await manager.getLibrary(sub, libraryId);
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

