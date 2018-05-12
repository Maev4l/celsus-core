function newMockEvent(sub, body, pathParameters, queryStringParameters) {
  const mockEvent = {
    requestContext: {
      authorizer: {
        claims: {
          sub,
        },
      },
    },
    body: JSON.stringify(body),
    pathParameters,
    queryStringParameters,
  };

  return mockEvent;
}

module.exports = {
  newMockEvent,
};
