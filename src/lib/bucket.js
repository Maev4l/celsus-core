import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import crypto from 'crypto';

const region = process.env.REGION;
const bucket = process.env.IMAGES_BUCKET;
const bookThumbnailsKey = process.env.BOOK_THUMBNAILS_KEY;
const endpoint = process.env.CLOUD_SERVICES_ENDPOINT;

const s3 = endpoint ? new S3Client({ region, endpoint }) : new S3Client({ region });

export const makeKey = (userId, bookId) => `${bookThumbnailsKey}/user.${userId}/book.${bookId}`;

export const saveImage = async (userId, bookId, imageb64) => {
  const key = makeKey(userId, bookId);

  let existingImageHash = null;
  try {
    const { ETag } = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    existingImageHash = ETag;
  } catch (e) {
    if (e.name !== 'NotFound') {
      throw e;
    }
  }

  const imageHash = crypto.createHash('md5').update(imageb64).digest('hex');

  if (existingImageHash !== `"${imageHash}"`) {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: imageb64,
      }),
    );
  }
};

export const deleteImage = async (userId, bookId) => {
  const key = makeKey(userId, bookId);

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};

const streamToString = (stream, encoding = 'utf8') => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString(encoding)));
  });
};

export const getImage = async (userId, bookId) => {
  const key = makeKey(userId, bookId);
  try {
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    const imageb64 = await streamToString(Body);
    return imageb64;
  } catch (e) {
    if (e.name === 'NoSuchKey') {
      return null;
    }
    throw e;
  }
};

export const getImages = async (userId, bookIds) => {
  const promises = bookIds.map(
    (id) =>
      new Promise((resolve, reject) => {
        const key = makeKey(userId, id);
        s3.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        )
          .then(({ Body }) => {
            streamToString(Body).then((imageb64) => resolve({ id, thumbnail: imageb64 }));
          })
          .catch((e) => {
            if (e.name === 'NoSuchKey') {
              resolve({ id, thumbnail: null });
            } else {
              reject(e);
            }
          });
      }),
  );

  const images = await Promise.all(promises);
  return images;
};
