const { Pool } = require('pg');
const uuidv4 = require('uuid/v4');
const Joi = require('joi');


const schema = require('./schemas').bookSchema;
const CelsusException = require('./exception');

const Utils = require('./utils');

const BOOKS_PAGE_SIZE = 5;

const THUMBNAIL_WIDTH = 80;
const THUMBNAIL_HEIGHT = 115;

class BookManager {
  /**
   * Retrieve list of books belonging to a given user
   * @param {string} userId Incognito id of the user
   * @param {string} offset offset is zero-based
   */
  async getBooks(userId, offset) {
    const pool = new Pool();
    const client = await pool.connect();
    const booksRows = await client.query(`SELECT B."id", B."library_id" as "libraryId", L."name" as "libraryName", B."title", B."description", B."isbn10", B."isbn13", B."thumbnail", B."authors", B."tags"
                                        FROM "celsus"."book" B
                                        JOIN "celsus"."library" L on B."library_id"=L."id"
                                        WHERE B."user_id"=$1
                                        ORDER BY B."title", B."id"
                                        LIMIT ${BOOKS_PAGE_SIZE} OFFSET ${BOOKS_PAGE_SIZE * offset};`, [userId]);
    const countRows = await client.query('SELECT COUNT(*) as total FROM "celsus"."book" where "user_id"=$1', [userId]);

    client.release();
    await pool.end();

    return {
      itemsPerPage: BOOKS_PAGE_SIZE,
      total: parseInt(countRows.rows[0].total, 10),
      books: booksRows.rows.map((row) => {
        const {
          id, libraryId, libraryName, title,
          description, isbn10, isbn13, thumbnail,
          authors, tags,
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
          authors: authors ? authors.split(';') : [],
          tags: tags ? tags.split(';') : [],
        };
      }),
    };
  }

  async deleteBook(userId, bookId) {
    const pool = new Pool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rowCount } = await client.query('DELETE FROM "celsus"."book" WHERE "id"=$1 AND "user_id"=$2;', [bookId, userId]);
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

  async createBook(userId, book) {
    const { error } = Joi.validate(book, schema);
    if (error) {
      const { message } = error.details[0];
      throw new CelsusException(message);
    }
    const pool = new Pool();
    const client = await pool.connect();
    const {
      libraryId, title, description, isbn10, isbn13, thumbnail, authors, tags,
    } = book;

    let resizedThumbnail = '';
    if (thumbnail) {
      resizedThumbnail = await Utils.resizeImage(thumbnail, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
    }

    try {
      await client.query('BEGIN');
      const { rows } = await client.query('SELECT "id" from "celsus"."library" WHERE "id"=$1 AND "user_id"=$2', [libraryId, userId]);
      if (rows.length === 0) {
        throw new CelsusException(`Library (id: ${book.libraryId}) does not exists`);
      }

      const id = uuidv4();

      const hash = Utils.hashBook(book);

      await client.query(
        'INSERT INTO "celsus"."book" ("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "thumbnail", "authors", "tags", "hash" ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);',
        [id, userId, libraryId, title.trim(), description.trim(), isbn10.trim(), isbn13.trim(), resizedThumbnail.trim(), authors.map(author => author.trim()).join(';'), tags.map(tag => tag.trim()).join(';'), hash],
      );
      await client.query('COMMIT');
      return {
        id,
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
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
      libraryId, title, description, isbn10, isbn13, thumbnail, authors, tags,
    } = book;

    try {
      await client.query('BEGIN');
      const librariesResult = await client.query('SELECT "id" from "celsus"."library" WHERE "id"=$1 AND "user_id"=$2;', [libraryId, userId]);
      if (librariesResult.rows.length === 0) {
        throw new CelsusException(`Library (id: ${book.libraryId}) does not exists`);
      }

      const hash = Utils.hashBook(book);

      let resizedThumbnail = '';
      if (thumbnail) {
        const thumbnailResult = await client.query('SELECT "thumbnail" FROM "celsus"."book" WHERE "id"=$1 AND "user_id"=$2;', [book.id, userId]);
        if (thumbnailResult.rows.length === 0) {
          throw new CelsusException(`Book (id: ${book.id}) does not exists`);
        }
        const existingThumbnail = thumbnailResult.rows[0].thumbnail;
        if (existingThumbnail !== thumbnail) {
          resizedThumbnail = await Utils.resizeImage(thumbnail, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
        } else {
          resizedThumbnail = thumbnail;
        }
      }

      const { rowCount } = await client.query(
        'UPDATE "celsus"."book" SET "library_id"=$3, "title"=$4, "description"=$5, "isbn10"=$6, "isbn13"=$7, "thumbnail"=$8, "authors"=$9, "tags"=$10, "hash"=$11 WHERE "id"=$1 AND "user_id"=$2;',
        [book.id, userId, libraryId, title.trim(), description.trim(), isbn10.trim(), isbn13.trim(), resizedThumbnail.trim(), authors.map(author => author.trim()).join(';'), tags.map(tag => tag.trim()).join(';'), hash],
      );
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
}

module.exports = BookManager;
module.exports.BooksPerPage = BOOKS_PAGE_SIZE;

