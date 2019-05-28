/**
 * Dispatch message to the according function
 */
import CelsusException from './exception';
import { INCOMING_OPERATIONS } from './utils';
import * as BookManager from './book-manager';

const registry = new Map();

registry.set(INCOMING_OPERATIONS.VALIDATE_LEND_BOOK, async (payload, replyAddress) => {
  const { lendingId, bookId, userId } = payload;

  await BookManager.validateBook(userId, bookId, lendingId, replyAddress);
});

export default async (operation, payload, replyAddress) => {
  const func = registry.get(operation);
  if (!func) {
    throw new CelsusException(`Invalid operation: ${operation}`);
  }

  await func(payload, replyAddress);
};
