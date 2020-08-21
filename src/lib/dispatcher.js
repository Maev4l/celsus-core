/**
 * Dispatch message to the according function
 */
import CelsusException from './exception';
import { INCOMING_OPERATIONS } from './utils';
import * as BookManager from './book-manager';

const registry = new Map();

registry.set(INCOMING_OPERATIONS.VALIDATE_LEND_BOOK, async (payload, replyAddress) => {
  const { userId, bookId, lendingId } = payload;
  await BookManager.validateBook(userId, bookId, lendingId, replyAddress);
});

registry.set(INCOMING_OPERATIONS.CONFIRM_LEND_BOOK, async (payload) => {
  const { lendingId, bookId, userId } = payload;
  await BookManager.confirmLendBook(userId, bookId, lendingId);
});

registry.set(INCOMING_OPERATIONS.CANCEL_LEND_BOOK, async (payload) => {
  const { bookId, userId } = payload;

  await BookManager.cancelLendBook(userId, bookId);
});

registry.set(INCOMING_OPERATIONS.RETURN_LENT_BOOK, async (payload) => {
  const { bookId, userId } = payload;
  await BookManager.returnLentBook(userId, bookId);
});

export default async (operation, payload, replyAddress) => {
  const func = registry.get(operation);

  if (!func) {
    throw new CelsusException(`Invalid operation: ${operation}`);
  }

  await func(payload, replyAddress);
};
