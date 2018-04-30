const librariesManager = require('./lib/libraries-manager');


exports.getLibraries = async (event) => {
  const result = await librariesManager.getLibraries();

  const response = {
    statusCode: 200,
    body: JSON.stringify(result),
  };
  return response;
};
