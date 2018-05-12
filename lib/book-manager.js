const { Pool } = require('pg');


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
}

module.exports = BookManager;
