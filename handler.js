const LibraryManager = require('./lib/library-manager');


exports.getLibraries = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;
  const manager = new LibraryManager();
  const result = await manager.getLibraries(sub);

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(result),
  };
  return response;
};

exports.postLibrary = async (event) => {
  const library = JSON.parse(event.body);
  const { sub } = event.requestContext.authorizer.claims;
  let result = '';
  let statusCode;

  // If a library does not have an existing id, it means we are trying to create it
  const manager = new LibraryManager();
  if (!library.id) {
    result = await manager.createLibrary(sub, library);
    statusCode = 201;
  } else {
    const updated = await manager.updateLibrary(sub, library);
    if (updated) {
      statusCode = 204;
    } else {
      statusCode = 400;
    }
  }

  const response = {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(result),
  };

  return response;
};

exports.deleteLibrary = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;

  const libraryId = event.pathParameters.id;
  const manager = new LibraryManager();
  const result = await manager.deleteLibrary(sub, libraryId);
  const statusCode = result ? 204 : 404;

  const response = {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };

  return response;
};

exports.getLibrary = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;

  const libraryId = event.pathParameters.id;
  const manager = new LibraryManager();
  const result = await manager.getLibrary(sub, libraryId);
  let statusCode;
  let body = '';
  if (result.length === 1) {
    statusCode = 200;
    body = JSON.stringify(result[0]);
  } else if (result.length === 0) {
    statusCode = 404;
  } else {
    // We have several libraries with the same identifiers
    statusCode = 500;
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

