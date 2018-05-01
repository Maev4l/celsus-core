const librariesManager = require('./lib/libraries-manager');


exports.getLibraries = async (event) => {
  // const { claims } = event.requestContext.authorizer;
  const result = await librariesManager.getLibraries();
  /* const result = {
    libraries,
    username: claims['cognito:username'],
    userId: claims.sub,
  }; */

  const response = {
    statusCode: 200,
    body: JSON.stringify(result),
  };
  return response;
};
