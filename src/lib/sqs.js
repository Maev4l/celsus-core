import AWS from 'aws-sdk';

import loggerFactory from './logger';

const logger = loggerFactory.getLogger('sqs');

const { region, coreQueueUrl } = INFRA;

AWS.config.update({ region });
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
          StringValue: coreQueueUrl,
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
