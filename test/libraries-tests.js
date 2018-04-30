const assert = require('assert');

const { getLibraries } = require('../handler');

describe('Libraries Tests', () => {
  describe('Simple Fetch libraries', () => {
    it('Returns list of libraries', async () => {
      const response = await getLibraries();
      const { statusCode, body } = response;
      assert.strictEqual(statusCode, 200);
      const libraries = JSON.parse(body);
      assert.deepStrictEqual(libraries, { libraries: [] });
    });
  });
});
