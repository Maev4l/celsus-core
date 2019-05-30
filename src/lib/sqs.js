import AWS from 'aws-sdk';

import { logger } from './logger';

const CORE_QUEUE = process.env.CORE_QUEUE_URL;

const REGION = process.env.region;
AWS.config.update({ region: REGION });
const sqsClient = new AWS.SQS({ sslEnabled: true, apiVersion: 'latest' });

const sqs = {
  sendMessage: async (message, destination) => {
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
  },
  sendMessageWithReply: async (message, destination) => {
    const request = sqsClient.sendMessage({
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
  },
};

export default sqs;
