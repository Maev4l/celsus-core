import AWS from 'aws-sdk';

import { logger } from './logger';
import { OUTGOING_OPERATIONS } from './utils';

const CORE_QUEUE = process.env.CORE_QUEUE_URL;

const REGION = process.env.region;

AWS.config.update({ region: REGION });
const sqs = new AWS.SQS({ sslEnabled: true, apiVersion: 'latest' });

export const sendMessage = async (message, destination) => {
  const request = sqs.sendMessage({
    QueueUrl: destination,
    MessageBody: JSON.stringify(message),
  });

  try {
    const { MessageId } = await request.promise();
    logger.info(`Message sent: ${MessageId}`);
    return MessageId;
  } catch (error) {
    logger.error(`Fail to send message: ${error.message}`);
    throw error;
  }
};

export const sendMessageWithReply = async (message, destination) => {
  const request = sqs.sendMessage({
    QueueUrl: destination,
    MessageBody: JSON.stringify(message),
    MessageAttributes: {
      replyAddress: {
        DataType: 'String',
        StringValue: CORE_QUEUE,
      },
    },
  });

  try {
    const { MessageId } = await request.promise();
    logger.info(`Message sent: ${MessageId}`);
    return MessageId;
  } catch (error) {
    logger.error(`Fail to send message: ${error.message}`);
    throw error;
  }
};

export const replyBookValidation = async (userId, lendingId, bookId, status, replyAddress) => {
  logger.info(`Reply book validation - lending: ${lendingId}`);
  await sendMessage(
    {
      operation: OUTGOING_OPERATIONS.VALIDATE_LEND_BOOK,
      userId,
      lendingId,
      bookId,
      status,
    },
    replyAddress,
  );
};
