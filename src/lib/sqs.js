import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

import loggerFactory from './logger';

const logger = loggerFactory.getLogger('sqs');

const { region, coreQueueUrl } = INFRA;

const sqsClient = new SQSClient({ region, tls: true });

const sqs = {
  sendMessage: async (message, destination) => {
    try {
      const { MessageId } = await sqsClient.send(
        new SendMessageCommand({
          QueueUrl: destination,
          MessageBody: JSON.stringify(message),
        }),
      );
      logger.info(`Message sent: ${MessageId}`);
      return MessageId;
    } catch (error) {
      logger.error(`Fail to send message: ${error.message}`);
      throw error;
    }
  },
  sendMessageWithReply: async (message, destination) => {
    try {
      const { MessageId } = await sqsClient.promise(
        new SendMessageCommand({
          QueueUrl: destination,
          MessageBody: JSON.stringify(message),
          MessageAttributes: {
            replyAddress: {
              DataType: 'String',
              StringValue: coreQueueUrl,
            },
          },
        }),
      );
      logger.info(`Message sent: ${MessageId}`);
      return MessageId;
    } catch (error) {
      logger.error(`Fail to send message: ${error.message}`);
      throw error;
    }
  },
};

export default sqs;
