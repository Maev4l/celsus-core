const { Pool } = require('pg');
const uuidv4 = require('uuid/v4');


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

async function createLibrary(userId, library) {
  const pool = new Pool();
  const client = await pool.connect();
  const { name, description } = library;
  const id = uuidv4();
  await client.query('INSERT INTO "celsus"."library" ("id", "user_id", "name", "description") VALUES ($1, $2, $3, $4);', [id, userId, name, description]);
  client.release();
  await pool.end();
  return {
    id,
  };
}
module.exports = {
  getLibraries,
  createLibrary,
};

