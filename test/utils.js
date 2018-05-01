function newMockEvent(sub, body) {
  const mockEvent = {
    requestContext: {
      authorizer: {
        claims: {
          sub,
        },
      },
    },
    body: JSON.stringify(body),
  };

  return mockEvent;
}

module.exports = {
  newMockEvent,
};
