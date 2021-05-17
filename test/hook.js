/**
 * As npm posttest is not triggered when tests fail,
 * it is more robust to rely on Mocha root hooks to provision and
 * clean up the database after tests
 */

import childProcess from 'child_process';
import { S3Client, CreateBucketCommand, DeleteBucketCommand } from '@aws-sdk/client-s3';

const {
  env: { REGION, LOCALSTACK_ENDPOINT },
} = process;

const s3 = new S3Client({ region: REGION, endpoint: LOCALSTACK_ENDPOINT });

before('Initialize database & localstack', async () => {
  const cmd = `psql --host ${process.env.PGHOST} --dbname ${process.env.PGDATABASE} --username ${process.env.PGUSER} --port ${process.env.PGPORT} --file scripts/initialize.sql`;
  childProcess.execSync(cmd);
  await s3.send(new CreateBucketCommand({ Bucket: 'test-bucket' }));
});

after('Clean up database & localstack', async () => {
  const cmd = `psql --host ${process.env.PGHOST} --dbname ${process.env.PGDATABASE} --username ${process.env.PGUSER} --port ${process.env.PGPORT} --command 'DROP SCHEMA "${process.env.PGSCHEMA}" CASCADE'`;
  childProcess.execSync(cmd);
  await s3.send(new DeleteBucketCommand({ Bucket: 'test-bucket' }));
});
