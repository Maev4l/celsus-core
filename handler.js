const LibraryManager = require('./lib/library-manager');


exports.getLibraries = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;
  const manager = new LibraryManager();
  const result = await manager.getLibraries(sub);

  const response = {
    statusCode: 200,
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
    body: JSON.stringify(result),
  };

  return response;
};
