/**
 * As npm posttest is not triggered when tests fail,
 * it is more robust to rely on Mocha root hooks to provision and
 * clean up the database after tests
 */

import childProcess from 'child_process';

import { createBucket, removeBucket, provisionBucket } from './utils';

before('Initialize database & localstack', async () => {
  const cmd = `psql --host ${process.env.PGHOST} --dbname ${process.env.PGDATABASE} --username ${process.env.PGUSER} --port ${process.env.PGPORT} --file scripts/initialize.sql`;
  childProcess.execSync(cmd);
  await createBucket();
  await provisionBucket();
});

after('Clean up database & localstack', async () => {
  const cmd = `psql --host ${process.env.PGHOST} --dbname ${process.env.PGDATABASE} --username ${process.env.PGUSER} --port ${process.env.PGPORT} --command 'DROP SCHEMA "${process.env.PGSCHEMA}" CASCADE'`;
  childProcess.execSync(cmd);
  await removeBucket();
});
