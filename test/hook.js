/**
 * As npm posttest is not triggered when tests fail,
 * it is more robust to rely on Mocha root hooks to provision and
 * clean up the database after tests
 */

import childProcess from 'child_process';

import { createBucket, removeBucket, provisionBucket, injectS3Client } from './utils';

before('Initialize database & localstack', (done) => {
  injectS3Client();
  createBucket()
    .then(() => provisionBucket())
    .then(() => {
      const cmd = `psql --host ${process.env.PGHOST} --dbname ${process.env.PGDATABASE} --username ${process.env.PGUSER} --port ${process.env.PGPORT} --file scripts/initialize.sql`;
      childProcess.execSync(cmd);
      done();
    });
});

after('Clean up database & localstack', (done) => {
  removeBucket().then(() => {
    const cmd = `psql --host ${process.env.PGHOST} --dbname ${process.env.PGDATABASE} --username ${process.env.PGUSER} --port ${process.env.PGPORT} --command 'DROP SCHEMA "${process.env.PGSCHEMA}" CASCADE'`;
    childProcess.execSync(cmd);
    done();
  });
});
