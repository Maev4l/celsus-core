const librariesManager = require('./lib/libraries-manager');


exports.getLibraries = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;
  const result = await librariesManager.getLibraries(sub);

  const response = {
    statusCode: 200,
    body: JSON.stringify(result),
  };
  return response;
};

exports.postLibrary = async (event) => {
  const library = JSON.parse(event.body);
  const { sub } = event.requestContext.authorizer.claims;
  let result;
  let statusCode;
  if (!library.id) {
    result = await librariesManager.createLibrary(sub, library);
    statusCode = 201;
  }

  const response = {
    statusCode,
    body: JSON.stringify(result),
  };

  return response;
};
