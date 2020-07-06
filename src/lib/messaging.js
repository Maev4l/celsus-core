import sqs from './sqs';

import loggerFactory from './logger';

import { OUTGOING_OPERATIONS } from './utils';

const logger = loggerFactory.getLogger('messaging');

const messaging = {
  replyBookValidation: async (userId, bookId, lendingId, result, replyAddress) => {
    logger.info(`Reply book validation - lending: ${lendingId}`);
    await sqs.sendMessage(
      {
        operation: OUTGOING_OPERATIONS.VALIDATE_LEND_BOOK,
        userId,
        lendingId,
        bookId,
        result,
      },
      replyAddress,
    );
  },
};

export default messaging;
