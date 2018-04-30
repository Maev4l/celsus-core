const { Pool } = require('pg');

async function getLibraries() {
  const pool = new Pool();
  const client = await pool.connect();
  const { rows } = await client.query('SELECT "id", "user_id" as userId, "name", "description" FROM "celsus"."library";');
  client.release();
  await pool.end();
  return {
    libraries: rows,
  };
}

module.exports.getLibraries = getLibraries;
