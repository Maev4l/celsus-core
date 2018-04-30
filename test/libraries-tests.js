const assert = require('assert');
require('dotenv').config();

const { getLibraries } = require('../handler');

describe('Libraries Tests', () => {
  describe('Simple Fetch libraries', () => {
    it('Returns list of libraries', async () => {
      const response = await getLibraries();
      const { statusCode, body } = response;
      assert.strictEqual(statusCode, 200);
      const result = JSON.parse(body);
      assert.strictEqual(1, result.libraries.length);
      const expected = {
        libraries: [
          {
            id: '1',
            userid: '',
            name: 'My Book Title',
            description: 'My Book description',
          },
        ],
      };
      assert.deepStrictEqual(result, expected);
    });
  });
});
