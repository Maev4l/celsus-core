/**
 * As npm posttest is not triggered when tests fail,
 * it is more robust to rely on Mocha root hooks to povision and
 * clean up the database after tests
 */

const childProcess = require('child_process');

before('Initialiaze database', () => {
  childProcess.execFileSync('./scripts/before_test.sh', [], { shell: true });
});

after('Clean up database', () => {
  childProcess.execFileSync('./scripts/after_test.sh', [], { shell: true });
});
