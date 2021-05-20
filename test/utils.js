import {
  S3Client,
  CreateBucketCommand,
  DeleteBucketCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import crypto from 'crypto';
import pgpromise from 'pg-promise';

import books from '../scripts/books.json';
import { makeKey } from '../src/lib/bucket';

const {
  env: { REGION, CLOUD_SERVICES_ENDPOINT, IMAGES_BUCKET },
} = process;

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

const s3 = new S3Client({ region: REGION, endpoint: CLOUD_SERVICES_ENDPOINT, maxAttempts: 10 });

export const createBucket = async (bucket = IMAGES_BUCKET) => {
  await s3.send(new CreateBucketCommand({ Bucket: bucket }));
};

export const removeBucket = async (bucket = IMAGES_BUCKET) => {
  const { Contents } = await s3.send(new ListObjectsV2Command({ Bucket: bucket }));

  if (Contents && Contents.length > 0) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: Contents.map((c) => {
            const { Key } = c;
            return { Key };
          }),
        },
      }),
    );
  }
  await s3.send(new DeleteBucketCommand({ Bucket: bucket }));
};

export const checkThumbnailExists = async (userId, bookId, bucket = IMAGES_BUCKET) => {
  const key = makeKey(userId, bookId);
  try {
    const { ETag } = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return { hash: ETag };
  } catch (e) {
    return { hash: null };
  }
};

export const provisionBucket = async (bucket = IMAGES_BUCKET) => {
  const promises = books.map(
    (book) =>
      new Promise((resolve) => {
        const { id, userId, thumbnail } = book;
        const key = makeKey(userId, id);
        s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: thumbnail,
          }),
        ).then(() => resolve());
      }),
  );

  await Promise.all(promises);
};

export const computeHash = (data) => crypto.createHash('md5').update(data).digest('hex');

const pgp = pgpromise();
pgp.pg.types.setTypeParser(20 /* int8 */, (val) => parseInt(val, 10));

export const database = pgp({ capSQL: true });
