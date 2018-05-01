const assert = require('assert');
require('dotenv').config();

const { getLibraries } = require('../handler');
const { newMockEvent } = require('./utils');

describe('Libraries Tests', () => {
  describe('Simple Fetch libraries', () => {
    it('Returns list of libraries', async () => {
      const event = newMockEvent('user1');

      const response = await getLibraries(event);
      const { statusCode, body } = response;
      assert.strictEqual(statusCode, 200);
      const result = JSON.parse(body);
      assert.strictEqual(1, result.libraries.length);
      const expected = {
        libraries: [
          {
            id: '1',
            name: 'My Book Title',
            description: 'My Book description',
          },
        ],
      };
      assert.deepStrictEqual(result, expected);
    });
  });
});
