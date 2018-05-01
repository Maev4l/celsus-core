const librariesManager = require('./lib/libraries-manager');


exports.getLibraries = async (event) => {
  const { sub } = event.requestContext.authorizer.claims;
  const result = await librariesManager.getLibraries(sub);
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
