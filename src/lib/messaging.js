import sqs from './sqs';

import { logger } from './logger';
import { OUTGOING_OPERATIONS } from './utils';

const messaging = {
  replyBookValidation: async (userId, bookId, lendingId, status, replyAddress) => {
    logger.info(`Reply book validation - lending: ${lendingId}`);
    await sqs.sendMessage(
      {
        operation: OUTGOING_OPERATIONS.VALIDATE_LEND_BOOK,
        userId,
        lendingId,
        bookId,
        status,
      },
      replyAddress,
    );
  },
};

export default messaging;
