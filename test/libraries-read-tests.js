import { assert } from 'chai';

import './config';
import { getLibrary, getLibraries } from '../src/handler';
import { makeMockEvent } from './utils';

describe('Libraries Tests (READ)', async () => {
  it('Returns list of libraries with no books', async () => {
    const event = makeMockEvent('user1');

    const { libraries } = await getLibraries(event);

    assert.strictEqual(1, libraries.length);
    const expected = [
      {
        id: '1',
        booksCount: 0,
        name: 'My Library Name',
        description: 'My Library description',
      },
    ];

    assert.deepEqual(libraries, expected);
  });

  it('Returns list of libraries with some books', async () => {
    const event = makeMockEvent('user4');

    const { libraries } = await getLibraries(event);

    assert.strictEqual(1, libraries.length);
    const expected = [
      {
        id: '6',
        booksCount: 2,
        name: 'My Library Name',
        description: 'My Library description',
      },
    ];
    assert.deepEqual(libraries, expected);
  });

  it('Returns a single library', async () => {
    const id = '5';
    const event = makeMockEvent('user3', { id });

    const library = await getLibrary(event);

    const expected = {
      id,
      booksCount: 0,
      name: 'My Library Name for user 3',
      description: 'To be read',
    };
    assert.deepEqual(library, expected);
  });

  it('Fails when fetching an unknown library', async () => {
    const id = 'xxx';
    const event = makeMockEvent('user2', { id });
    const response = await getLibrary(event);

    assert.isNull(response);
  });

  it('Fails when fetching a library belonging to an unknown user', async () => {
    const id = '5';
    const event = makeMockEvent('xxx', { id });
    const response = await getLibrary(event);
    assert.isNull(response);
  });

  it('Fails when fetching a library not belonging to user', async () => {
    const id = '5';
    const event = makeMockEvent('user2', { id });
    const response = await getLibrary(event);
    assert.isNull(response);
  });
});
