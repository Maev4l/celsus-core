const { Pool } = require('pg');
const uuidv4 = require('uuid/v4');
const Joi = require('joi');

const schema = require('./schemas').bookSchema;
const CelsusException = require('./exception');

const Utils = require('./utils');

const schemaName = Utils.getDbSchemaName();

const BOOKS_PAGE_SIZE = 5;

class BookManager {
  /**
   * Retrieve list of books belonging to a given user
   * @param {string} userId Incognito id of the user
   * @param {string} offset offset is zero-based
   */
  async getBooks(userId, offset) {
    const pool = new Pool();
    const client = await pool.connect();
    const booksRows = await client.query(
      `SELECT B."id", B."library_id" as "libraryId", L."name" as "libraryName", B."title", B."description", B."isbn10", B."isbn13", B."thumbnail",
                                        array_to_json(B."authors") as "authors", array_to_json(B."tags") as tags, B."language"
                                        FROM "${schemaName}"."book" B
                                        JOIN "${schemaName}"."library" L on B."library_id"=L."id"
                                        WHERE B."user_id"=$1
                                        ORDER BY B."title", B."id"
                                        LIMIT ${BOOKS_PAGE_SIZE} OFFSET ${BOOKS_PAGE_SIZE *
        offset};`,
      [userId],
    );
    const countRows = await client.query(
      `SELECT COUNT(*) as total FROM "${schemaName}"."book" where "user_id"=$1`,
      [userId],
    );

    client.release();
    await pool.end();

    return {
      itemsPerPage: BOOKS_PAGE_SIZE,
      total: parseInt(countRows.rows[0].total, 10),
      books: booksRows.rows.map(row => {
        const {
          id,
          libraryId,
          libraryName,
          title,
          description,
          isbn10,
          isbn13,
          thumbnail,
          authors,
          tags,
          language,
        } = row;
        return {
          id,
          title,
          description,
          library: {
            id: libraryId,
            name: libraryName,
          },
          isbn10,
          isbn13,
          thumbnail,
          authors,
          tags,
          language: Utils.fromPGLanguage(language),
        };
      }),
    };
  }

  async deleteBook(userId, bookId) {
    const pool = new Pool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rowCount } = await client.query(
        `DELETE FROM "${schemaName}"."book" WHERE "id"=$1 AND "user_id"=$2;`,
        [bookId, userId],
      );

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

  async createBook(userId, book) {
    const { error } = Joi.validate(book, schema);
    if (error) {
      const { message } = error.details[0];
      throw new CelsusException(message);
    }
    const pool = new Pool();
    const client = await pool.connect();
    const {
      libraryId,
      title,
      description,
      isbn10,
      isbn13,
      thumbnail,
      authors,
      tags,
      language,
    } = book;

    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `SELECT "id", "name" as "libraryName" from "${schemaName}"."library" WHERE "id"=$1 AND "user_id"=$2`,
        [libraryId, userId],
      );
      if (rows.length === 0) {
        throw new CelsusException(`Library (id: ${libraryId}) does not exists`);
      }

      const id = uuidv4();

      const hash = Utils.hashBook(book);

      await client.query(
        `INSERT INTO "${schemaName}"."book" ("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "thumbnail", "authors", "tags", "language", "hash" )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
        [
          id,
          userId,
          libraryId,
          title.trim(),
          description.trim(),
          isbn10.trim(),
          isbn13.trim(),
          thumbnail.trim(),
          authors.map(author => author.trim()),
          tags.map(tag => tag.trim()),
          Utils.toPGLanguage(language.trim()),
          hash,
        ],
      );

      await client.query('COMMIT');
      return {
        id,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
      await pool.end();
    }
  }

  async updateBook(userId, book) {
    const { error } = Joi.validate(book, schema);
    if (error) {
      const { message } = error.details[0];
      throw new CelsusException(message);
    }
    const pool = new Pool();
    const client = await pool.connect();
    const {
      libraryId,
      title,
      description,
      isbn10,
      isbn13,
      thumbnail,
      authors,
      tags,
      language,
    } = book;

    try {
      await client.query('BEGIN');
      const librariesResult = await client.query(
        `SELECT "id", "name" as "libraryName" from "${schemaName}"."library" WHERE "id"=$1 AND "user_id"=$2;`,
        [libraryId, userId],
      );
      if (librariesResult.rows.length === 0) {
        throw new CelsusException(`Library (id: ${book.libraryId}) does not exists`);
      }

      const hash = Utils.hashBook(book);

      const { rowCount } = await client.query(
        `UPDATE "${schemaName}"."book" SET "library_id"=$3, "title"=$4, "description"=$5, "isbn10"=$6, "isbn13"=$7, "thumbnail"=$8,
        "authors"=$9, "tags"=$10, "hash"=$11, "language"=$12 WHERE "id"=$1 AND "user_id"=$2;`,
        [
          book.id,
          userId,
          libraryId,
          title.trim(),
          description.trim(),
          isbn10.trim(),
          isbn13.trim(),
          thumbnail.trim(),
          authors.map(author => author.trim()),
          tags.map(tag => tag.trim()),
          hash,
          Utils.toPGLanguage(language.trim()),
        ],
      );

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
}

module.exports = BookManager;
module.exports.BooksPerPage = BOOKS_PAGE_SIZE;
