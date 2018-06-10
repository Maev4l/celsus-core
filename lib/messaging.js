const { logger } = require('./logger');
const AWS = require('aws-sdk');

exports.publish = async (topic, subject, message) => {
  const sns = new AWS.SNS({ region: process.env.REGION });

  const params = {
    Message: typeof message === 'object' ? JSON.stringify(message) : message,
    Subject: subject,
    TopicArn: topic,
  };

  try {
    const result = await sns.publish(params).promise();
    logger.debug(`Publish '${subject}' to '${topic}' completed. Message id: ${result.MessageId}`);
  } catch (err) {
    logger.error(`Fail to send '${subject}' to '${topic}': ${err.message}`);
    throw err;
  }
};

