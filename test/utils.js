function newMockEvent(sub) {
  const mockEvent = {
    requestContext: {
      authorizer: {
        claims: {
          sub,
        },
      },
    },
  };

  return mockEvent;
}

module.exports = {
  newMockEvent,
};
