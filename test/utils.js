function newMockEvent(sub, body, pathParameters) {
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
  };

  return mockEvent;
}

module.exports = {
  newMockEvent,
};
