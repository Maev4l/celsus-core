const { Pool } = require('pg');
const uuidv4 = require('uuid/v4');
const Joi = require('joi');

const schema = require('./schemas').librarySchema;

/** In Postgres, COUNT is BigInt type, the NodeJS driver converts it to a JS
 *  string type in order to avoid overflow.
 *  As we are never have more than Number.MAX_VALUE of books for a given library,
 *  we assume we can convert to integer safely
 */
const convertRowBooksCountToInteger = (row) => {
  const { count, ...rest } = row;
  const booksCount = parseInt(count, 10);
  return {
    booksCount,
    ...rest,
  };
};

class LibraryManager {
  async getLibraries(userId) {
    const pool = new Pool();
    const client = await pool.connect();

    const { rows } = await client.query(`SELECT L."id", L."name", L."description", COUNT(B."library_id") as "count"
                                        FROM "celsus"."library" L 
                                        LEFT OUTER JOIN "celsus"."book" B ON B."library_id"=L."id"
                                        WHERE L."user_id"=$1
                                        GROUP BY L."id", L."name",L."description"
                                        ORDER BY L."name";`, [userId]);
    client.release();
    await pool.end();

    return {
      libraries: rows.map(convertRowBooksCountToInteger),
    };
  }

  async createLibrary(userId, library) {
    const { error } = Joi.validate(library, schema);
    if (error) {
      throw error;
    }
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

  async updateLibrary(userId, library) {
    const pool = new Pool();
    const client = await pool.connect();
    const { name, description } = library;
    const { rowCount } = await client.query('UPDATE "celsus"."library" SET "name"=$1, "description"=$2 WHERE "id"=$3 AND "user_id"=$4;', [name, description, library.id, userId]);
    client.release();
    await pool.end();
    return (rowCount === 1);
  }

  async deleteLibrary(userId, libraryId) {
    const pool = new Pool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rowCount } = await client.query('DELETE FROM "celsus"."library" WHERE "id"=$1 AND "user_id"=$2;', [libraryId, userId]);
      if (rowCount === 1) {
        await client.query('DELETE FROM "celsus"."book" WHERE "library_id"=$1;', [libraryId]);
      }
      await client.query('COMMIT');
      return (rowCount === 1);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
      await pool.end();
    }
  }

  async getLibrary(userId, libraryId) {
    const pool = new Pool();
    const client = await pool.connect();
    const { rows } = await client.query(`SELECT L."id", L."name", L."description", COUNT(B."library_id") as "count"
                                        FROM "celsus"."library" L 
                                        LEFT OUTER JOIN "celsus"."book" B ON B."library_id"=L."id"
                                        WHERE L."id"=$1 AND L."user_id"=$2 
                                        GROUP BY L."id", L."name",L."description"
                                        ORDER BY L."name";`, [libraryId, userId]);
    client.release();
    await pool.end();
    return rows.map(convertRowBooksCountToInteger);
  }
}

module.exports = LibraryManager;
