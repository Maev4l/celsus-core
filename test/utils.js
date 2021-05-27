import {
  S3Client,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import crypto from 'crypto';
import pgpromise from 'pg-promise';

import './config';

import books from '../scripts/books.json';
import { makeKey, setS3Client } from '../src/lib/bucket';

const region = process.env.REGION;
const endpoint = process.env.CLOUD_SERVICES_ENDPOINT;
const bucket = process.env.IMAGES_BUCKET;

export const newMockEvent = (sub, body, pathParameters, queryStringParameters) => {
  const mockEvent = {
    requestContext: {
      authorizer: {
        claims: {
          sub,
        },
      },
    },
    body: JSON.stringify(body),
    pathParameters,
    queryStringParameters,
  };

  return mockEvent;
};

export const makeMockEvent = (userId, payload) => ({
  userId,
  payload,
});

export const newMockMessage = (message, replyAddress) => {
  let record = {
    messageId: '0',
    body: JSON.stringify(message),
    messageAttributes: {},
  };
  if (replyAddress) {
    record = { ...record, messageAttributes: { replyAddress: { stringValue: replyAddress } } };
  }

  const mockMessage = {
    Records: [record],
  };

  return mockMessage;
};

const s3 = new S3Client({
  region,
  endpoint,
  // maxAttempts: 10,
  forcePathStyle: 'true',
});

export const injectS3Client = () => {
  setS3Client(s3);
};

export const createBucket = async () => {
  await s3.send(new CreateBucketCommand({ Bucket: bucket }));
};

export const removeBucket = async () => {
  const { Contents } = await s3.send(new ListObjectsV2Command({ Bucket: bucket }));

  if (Contents && Contents.length > 0) {
    const funcs = Contents.map((c) => {
      const { Key } = c;
      return new Promise((done) => {
        // Do not use DeleteObjectsCommand here
        // as it seems to be bugged with localstack and @aws-sdk/client-s3 ^3.12.0
        s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key,
          }),
        ).then(() => done());
      });
    });
    await Promise.all(funcs);
  }

  await s3.send(new DeleteBucketCommand({ Bucket: bucket }));
};

export const checkThumbnailExists = async (userId, bookId) => {
  const key = makeKey(userId, bookId);
  try {
    const { ETag } = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { hash: ETag };
  } catch (e) {
    return { hash: null };
  }
};

export const provisionBucket = async () => {
  const promises = books.map(
    (book) =>
      new Promise((resolve, reject) => {
        const { id, userId, thumbnail } = book;
        const key = makeKey(userId, id);
        s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: thumbnail,
          }),
        )
          .then(() => resolve())
          .catch((e) => reject(e));
      }),
  );

  await Promise.all(promises);
};

export const computeHash = (data) => crypto.createHash('md5').update(data).digest('hex');

const pgp = pgpromise();
pgp.pg.types.setTypeParser(20 /* int8 */, (val) => parseInt(val, 10));

export const database = pgp({ capSQL: true });
