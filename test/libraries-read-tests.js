import { assert } from 'chai';
import dotenv from 'dotenv';

import { getLibrary, getLibraries } from '../src/handler';
import { newMockEvent } from './utils';

dotenv.config();

describe('Libraries Tests (READ)', async () => {
  it('Returns list of libraries with no books', async () => {
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
          booksCount: 0,
          name: 'My Library Name',
          description: 'My Library description',
        },
      ],
    };
    assert.deepEqual(result, expected);
  });

  it('Returns list of libraries with some books', async () => {
    const event = newMockEvent('user4');

    const response = await getLibraries(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 200);
    const result = JSON.parse(body);
    assert.strictEqual(1, result.libraries.length);
    const expected = {
      libraries: [
        {
          id: '6',
          booksCount: 2,
          name: 'My Library Name',
          description: 'My Library description',
        },
      ],
    };
    assert.deepEqual(result, expected);
  });

  it('Returns a single library', async () => {
    const id = '5';
    const event = newMockEvent('user3', '', { id });

    const response = await getLibrary(event);
    const { statusCode, body } = response;
    assert.strictEqual(statusCode, 200);
    const result = JSON.parse(body);
    const expected = {
      id: '5',
      booksCount: 0,
      name: 'My Library Name for user 3',
      description: 'To be read',
    };
    assert.deepEqual(result, expected);
  });

  it('Fails when fetching an unknown library', async () => {
    const id = 'xxx';
    const event = newMockEvent('user2', '', { id });
    const response = await getLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
  });

  it('Fails when fetching a library belonging to an unknown user', async () => {
    const id = '5';
    const event = newMockEvent('xxx', '', { id });
    const response = await getLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
  });

  it('Fails when fetching a library not belonging to user', async () => {
    const id = '5';
    const event = newMockEvent('user2', '', { id });
    const response = await getLibrary(event);
    const { statusCode } = response;
    assert.strictEqual(statusCode, 404);
  });
});
