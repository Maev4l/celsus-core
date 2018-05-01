const { Pool } = require('pg');

async function getLibraries(userId) {
  const pool = new Pool();
  const client = await pool.connect();
  const { rows } = await client.query('SELECT "id", "name", "description" FROM "celsus"."library" WHERE "user_id"=$1 ORDER BY "name";', [userId]);
  client.release();
  await pool.end();
  return {
    libraries: rows,
  };
}

module.exports.getLibraries = getLibraries;
