const { Pool } = require('pg');
const { types } = require('pg');
const uuidv4 = require('uuid/v4');
const Joi = require('joi');

const schema = require('./schemas').librarySchema;
const CelsusException = require('./exception');

const Utils = require('./utils');

const schemaName = Utils.getDbSchemaName();

/** In Postgres, COUNT is BigInt type, the NodeJS driver converts it to a JS
 *  string type in order to avoid overflow.
 *  As we are never have more than Number.MAX_VALUE of books for a given library,
 *  we assume we can convert to integer safely
 */
types.setTypeParser(20 /* int8 */, val => parseInt(val, 10));

class LibraryManager {
  async getLibraries(userId) {
    const pool = new Pool();
    const client = await pool.connect();

    const { rows } = await client.query(
      `SELECT L."id", L."name", L."description", COUNT(B."library_id") as "booksCount"
                                        FROM "${schemaName}"."library" L 
                                        LEFT OUTER JOIN "${schemaName}"."book" B ON B."library_id"=L."id"
                                        WHERE L."user_id"=$1
                                        GROUP BY L."id", L."name",L."description"
                                        ORDER BY L."name";`,
      [userId],
    );
    client.release();
    await pool.end();

    return {
      libraries: rows,
    };
  }

  async createLibrary(userId, library) {
    const { error } = Joi.validate(library, schema);
    if (error) {
      const { message } = error.details[0];
      throw new CelsusException(message);
    }
    const pool = new Pool();
    const client = await pool.connect();
    const { name, description } = library;
    const id = uuidv4();
    await client.query(
      `INSERT INTO "${schemaName}"."library" ("id", "user_id", "name", "description") VALUES ($1, $2, $3, $4);`,
      [id, userId, name.trim(), description.trim()],
    );
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
    const { rowCount } = await client.query(
      `UPDATE "${schemaName}"."library" SET "name"=$1, "description"=$2 WHERE "id"=$3 AND "user_id"=$4;`,
      [name.trim(), description.trim(), library.id, userId],
    );
    client.release();
    await pool.end();
    return rowCount === 1;
  }

  async deleteLibrary(userId, libraryId) {
    const pool = new Pool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rowCount } = await client.query(
        `DELETE FROM "${schemaName}"."library" WHERE "id"=$1 AND "user_id"=$2;`,
        [libraryId, userId],
      );
      if (rowCount === 1) {
        await client.query(`DELETE FROM "${schemaName}"."book" WHERE "library_id"=$1;`, [
          libraryId,
        ]);
      }
      await client.query('COMMIT');
      return rowCount === 1;
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
    const { rows } = await client.query(
      `SELECT L."id", L."name", L."description", COUNT(B."library_id") as "booksCount"
                                        FROM "${schemaName}"."library" L 
                                        LEFT OUTER JOIN "${schemaName}"."book" B ON B."library_id"=L."id"
                                        WHERE L."id"=$1 AND L."user_id"=$2 
                                        GROUP BY L."id", L."name",L."description"
                                        ORDER BY L."name";`,
      [libraryId, userId],
    );
    client.release();
    await pool.end();
    return rows;
  }
}

module.exports = LibraryManager;
