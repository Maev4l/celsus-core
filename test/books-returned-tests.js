import { assert } from 'chai';

import { handleMessages } from '../src/handler';
import { INCOMING_OPERATIONS } from '../src/lib/utils';
import { newMockMessage, database } from './utils';

const schemaName = process.env.PGSCHEMA;

describe('Books Tests (LENDING)', async () => {
  it('Handles a returned book', async () => {
    const lendingId = 'lend2';
    const userId = 'user13';
    const bookId = '105';
    const contactId = 'contact1';
    const mockMessage = newMockMessage({
      operation: INCOMING_OPERATIONS.RETURN_LENT_BOOK,
      lendingId,
      userId,
      contactId,
      bookId,
    });

    await handleMessages(mockMessage);

    const row = await database.one(
      `SELECT "lending_id" AS "lendingId" FROM "${schemaName}"."book" WHERE id=$1`,
      [bookId],
    );
    assert.isNull(row.lendingId);
  });
});
