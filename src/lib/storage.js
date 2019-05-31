import pgpromise, { ParameterizedQuery } from 'pg-promise';

import { LENDING_STATUS } from './utils';

// Initialize pg-promise
const pgp = pgpromise();

/** In Postgres, COUNT is BigInt type, the NodeJS driver converts it to a JS
 *  string type in order to avoid overflow.
 *  As we are never have more than Number.MAX_VALUE of books for a given library,
 *  we assume we can convert to integer safely
 */
pgp.pg.types.setTypeParser(20 /* int8 */, val => parseInt(val, 10));

const database = pgp({ capSQL: true });

export const getDatabase = () => database;
export const getDbSchemaName = () => process.env.PGSCHEMA || 'celsus_core';

/** Convert Postgress Full Text Search language to web client language */
export const fromPGLanguage = pgLanguage => {
  switch (pgLanguage) {
    case 'french':
      return 'fr';
    case 'english':
      return 'gb';
    default:
      return 'fr';
  }
};

/** Convert web client language to Postgress Full Text Search language */
export const toPGLanguage = clientLanguage => {
  switch (clientLanguage) {
    case 'fr':
      return 'french';
    case 'gb':
      return 'english';
    default:
      return 'french';
  }
};

const schemaName = getDbSchemaName();

export const listLibraries = async userId => {
  const query = new ParameterizedQuery(
    `SELECT L."id", L."name", L."description", COUNT(B."library_id") AS "booksCount"
  FROM "${schemaName}"."library" L 
  LEFT OUTER JOIN "${schemaName}"."book" B ON B."library_id"=L."id"
  WHERE L."user_id"=$1
  GROUP BY L."id", L."name",L."description"
  ORDER BY L."name";`,
    [userId],
  );

  const rows = await database.any(query);
  return rows;
};

export const saveLibrary = async (userId, library) => {
  const { id, name, description } = library;
  const query = new ParameterizedQuery(
    `INSERT INTO "${schemaName}"."library" ("id", "user_id", "name", "description") VALUES ($1, $2, $3, $4);`,
    [id, userId, name.trim(), description.trim()],
  );

  await database.none(query);
};

export const modifyLibrary = async (userId, library) => {
  const { name, description, id } = library;
  const query = new ParameterizedQuery(
    `UPDATE "${schemaName}"."library" SET "name"=$1, "description"=$2 WHERE "id"=$3 AND "user_id"=$4;`,
  );

  const affectedRowCount = await database.result(
    query,
    [name.trim(), description.trim(), id, userId],
    r => r.rowCount,
  );

  return affectedRowCount;
};

export const removeLibrary = async (userId, libraryId) => {
  const affectedRowCount = await database.tx(async transaction => {
    const query1 = new ParameterizedQuery(
      `DELETE FROM "${schemaName}"."library" L WHERE "id"=$1 AND "user_id"=$2 AND
      EXISTS (SELECT 1 FROM "${schemaName}"."book" B WHERE L."id"=B."library_id" AND B."lending_id" IS NULL);`,
    );

    const rowCount = await transaction.result(query1, [libraryId, userId], r => r.rowCount);
    if (rowCount) {
      const query2 = new ParameterizedQuery(
        `DELETE FROM "${schemaName}"."book" WHERE "library_id"=$1;`,
      );
      await transaction.none(query2, [libraryId]);
    }
    return rowCount;
  });

  return affectedRowCount;
};

export const readLibrary = async (userId, libraryId) => {
  const query = new ParameterizedQuery(
    `SELECT L."id", L."name", L."description", COUNT(B."library_id") AS "booksCount"
                                      FROM "${schemaName}"."library" L 
                                      LEFT OUTER JOIN "${schemaName}"."book" B ON B."library_id"=L."id"
                                      WHERE L."id"=$1 AND L."user_id"=$2 
                                      GROUP BY L."id", L."name",L."description"
                                      ORDER BY L."name";`,
    [libraryId, userId],
  );

  const row = await database.oneOrNone(query);
  return row;
};

export const listBooks = async (userId, offset, pageSize, searchQuery) => {
  if (searchQuery) {
    const criterias = searchQuery.split(' ').join('&');
    const query1 = new ParameterizedQuery(
      `SELECT B."id", B."library_id" AS "libraryId", L."name" AS "libraryName", B."title", B."description", B."isbn10", B."isbn13", B."thumbnail",
      array_to_json(B."authors") AS "authors", array_to_json(B."tags") AS tags, B."language",
      B."book_set" AS "bookSet", B."book_set_order" AS "bookSetOrder", B."lending_id" AS "lendingId"
      FROM "${schemaName}"."book" B
      JOIN "${schemaName}"."library" L on B."library_id"=L."id"
      JOIN "${schemaName}"."books_search" S on S."id"=B."id"
      WHERE B."user_id"=$1
      AND S."document" @@ to_tsquery('simple',unaccent($2))
      ORDER BY B."title", B."id"
      LIMIT ${pageSize} OFFSET ${pageSize * offset};`,
      [userId, criterias],
    );

    const query2 = new ParameterizedQuery(
      `SELECT COUNT(*) AS total
      FROM "${schemaName}"."book" B 
      JOIN "${schemaName}"."books_search" S on S."id"=B."id"
      WHERE B."user_id"=$1
      AND S."document" @@ to_tsquery('simple',unaccent($2));`,
      [userId, criterias],
    );

    return database.task(async task => {
      const rows = await task.any(query1);
      const { total: rowCount } = await task.one(query2);
      return { rows, rowCount };
    });
  }

  const query1 = new ParameterizedQuery(
    `SELECT B."id", B."library_id" AS "libraryId", L."name" AS "libraryName", B."title", B."description", B."isbn10", B."isbn13", B."thumbnail",
        array_to_json(B."authors") AS "authors", array_to_json(B."tags") AS tags, B."language",
        B."book_set" AS "bookSet", B."book_set_order" AS "bookSetOrder", B."lending_id" AS "lendingId"
        FROM "${schemaName}"."book" B
        JOIN "${schemaName}"."library" L on B."library_id"=L."id"
        WHERE B."user_id"=$1
        ORDER BY B."title", B."id"
        LIMIT ${pageSize} OFFSET ${pageSize * offset};`,
    [userId],
  );

  const query2 = new ParameterizedQuery(
    `SELECT COUNT(*) AS total FROM "${schemaName}"."book" WHERE "user_id"=$1`,
    [userId],
  );
  return database.task(async task => {
    const rows = await task.any(query1);
    const { total: rowCount } = await task.one(query2);
    return { rows, rowCount };
  });
};

export const removeBook = async (userId, bookId) => {
  const query = new ParameterizedQuery(
    `DELETE FROM "${schemaName}"."book" WHERE "id"=$1 AND "user_id"=$2 AND "lending_id" IS NULL;`,
  );
  const rowCount = await database.result(query, [bookId, userId], r => r.rowCount);
  return rowCount;
};

export const saveBook = async (userId, book) => {
  const {
    id,
    libraryId,
    title,
    description,
    isbn10,
    isbn13,
    thumbnail,
    authors,
    tags,
    hash,
    language,
    bookSet,
    bookSetOrder,
  } = book;

  return database.tx(async transaction => {
    const query1 = new ParameterizedQuery(
      `SELECT COUNT(*) as count from "${schemaName}"."library" WHERE "id"=$1 AND "user_id"=$2`,
      [libraryId, userId],
    );
    const { count } = await transaction.one(query1);
    if (count === 0) {
      return count;
    }
    const query2 = new ParameterizedQuery(
      `INSERT INTO "${schemaName}"."book" ("id", "user_id", "library_id", "title", "description", "isbn10", "isbn13", "thumbnail", "authors", "tags", "language", "hash", "book_set", "book_set_order" )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`,
    );
    const rowCount = await transaction.result(
      query2,
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
        toPGLanguage(language.trim()),
        hash,
        bookSet.trim(),
        bookSetOrder,
      ],
      r => r.rowCount,
    );

    return rowCount;
  });
};

export const modifyBook = async (userId, book) => {
  const {
    id,
    libraryId,
    title,
    description,
    isbn10,
    isbn13,
    thumbnail,
    authors,
    tags,
    hash,
    language,
    bookSet,
    bookSetOrder,
  } = book;

  return database.tx(async transaction => {
    const query1 = new ParameterizedQuery(
      `SELECT COUNT(*) as count from "${schemaName}"."library" WHERE "id"=$1 AND "user_id"=$2`,
      [libraryId, userId],
    );
    const { count } = await transaction.one(query1);
    if (count === 0) {
      return count;
    }

    const query2 = new ParameterizedQuery(
      `UPDATE "${schemaName}"."book" SET "library_id"=$3, "title"=$4, "description"=$5, "isbn10"=$6, "isbn13"=$7, "thumbnail"=$8,
      "authors"=$9, "tags"=$10, "hash"=$11, "language"=$12, "book_set"=$13, "book_set_order"=$14 WHERE "id"=$1 AND "user_id"=$2;`,
    );

    const rowCount = await transaction.result(
      query2,
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
        hash,
        toPGLanguage(language.trim()),
        bookSet.trim(),
        bookSetOrder,
      ],
      r => r.rowCount,
    );

    return rowCount;
  });
};

export const transitionBookToLendingPending = async (userId, bookId) => {
  const query = new ParameterizedQuery(
    `UPDATE "${schemaName}"."book" SET "lending_id" = '${LENDING_STATUS.PENDING}' 
    WHERE user_id=$1 AND id=$2 AND lending_id IS NULL
    RETURNING id, title`,
    [userId, bookId],
  );

  const row = await database.oneOrNone(query);
  return row;
};

export const transitionBookToNotLent = async (userId, bookId) => {
  const query = new ParameterizedQuery(
    `UPDATE "${schemaName}"."book" SET "lending_id" = NULL 
    WHERE user_id=$1 AND id=$2`,
    [userId, bookId],
  );
  await database.none(query);
};

export const transitionBookToLendingConfirmed = async (userId, bookId, lendingId) => {
  const query = new ParameterizedQuery(
    `UPDATE "${schemaName}"."book" SET "lending_id" = $1 
    WHERE user_id=$2 AND id=$3`,
    [lendingId, userId, bookId],
  );

  await database.none(query);
};
