import { assert } from 'chai';
import sinon from 'sinon';

import './config';
import { handleMessages } from '../src/handler';
import {
  INCOMING_OPERATIONS,
  OUTGOING_OPERATIONS,
  LEND_BOOK_VALIDATION_STATUS,
} from '../src/lib/utils';
import { newMockMessage, database } from './utils';

import queue from '../src/lib/queue';

const schemaName = process.env.PGSCHEMA;

describe('Books Tests (LENDING)', async () => {
  let sinonSandbox;
  let stubSendMessage;

  beforeEach(async () => {
    sinonSandbox = sinon.createSandbox();
    stubSendMessage = sinonSandbox.stub(queue, 'sendMessage');
  });
  afterEach(async () => sinonSandbox.restore());

  it('Returns a successful book validation', async () => {
    const lendingId = 1;
    const userId = 'user12';
    const bookId = '101';
    const mockMessage = newMockMessage({
      operation: INCOMING_OPERATIONS.VALIDATE_LEND_BOOK,
      lendingId,
      userId,
      bookId,
    });

    await handleMessages(mockMessage);
    sinon.assert.calledOnce(stubSendMessage);
    sinon.assert.calledWith(stubSendMessage, {
      operation: OUTGOING_OPERATIONS.VALIDATE_LEND_BOOK,
      bookId,
      lendingId,
      userId,
      result: { status: LEND_BOOK_VALIDATION_STATUS.BOOK_VALIDATED, title: 'Book101' },
    });
  });

  it('Returns a failed book validation for a non existing book', async () => {
    const lendingId = '1';
    const userId = 'user12';
    const bookId = '9999';
    const mockMessage = newMockMessage({
      operation: INCOMING_OPERATIONS.VALIDATE_LEND_BOOK,
      lendingId,
      userId,
      bookId,
    });

    await handleMessages(mockMessage);
    sinon.assert.calledOnce(stubSendMessage);
    sinon.assert.calledWith(stubSendMessage, {
      operation: OUTGOING_OPERATIONS.VALIDATE_LEND_BOOK,
      bookId,
      lendingId,
      userId,
      result: { status: LEND_BOOK_VALIDATION_STATUS.BOOK_NOT_VALIDATED, title: null },
    });
  });

  it('Returns a failed book validation for a lent existing book', async () => {
    const lendingId = '1';
    const userId = 'user12';
    const bookId = '102';
    const mockMessage = newMockMessage({
      operation: INCOMING_OPERATIONS.VALIDATE_LEND_BOOK,
      lendingId,
      userId,
      bookId,
    });

    await handleMessages(mockMessage);
    sinon.assert.calledOnce(stubSendMessage);
    sinon.assert.calledWith(stubSendMessage, {
      operation: OUTGOING_OPERATIONS.VALIDATE_LEND_BOOK,
      bookId,
      lendingId,
      userId,
      result: { status: LEND_BOOK_VALIDATION_STATUS.BOOK_NOT_VALIDATED, title: null },
    });
  });

  it('Handles a book lending confirmation', async () => {
    const lendingId = '1';
    const userId = 'user12';
    const bookId = '103';
    const mockMessage = newMockMessage({
      operation: INCOMING_OPERATIONS.CONFIRM_LEND_BOOK,
      lendingId,
      userId,
      bookId,
    });

    await handleMessages(mockMessage);

    const row = await database.one(
      `SELECT "lending_id" AS "lendingId" FROM "${schemaName}"."book" WHERE id=$1`,
      [bookId],
    );
    assert.strictEqual(row.lendingId, lendingId);
  });

  it('Handles a book lending cancellation', async () => {
    const lendingId = '1';
    const userId = 'user12';
    const bookId = '104';
    const mockMessage = newMockMessage({
      operation: INCOMING_OPERATIONS.CANCEL_LEND_BOOK,
      lendingId,
      userId,
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
