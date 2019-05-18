import hash from 'object-hash';

export const hashBook = book => {
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
    bookSet,
    bookSetOrder,
  } = book;

  return hash(
    {
      libraryId,
      title,
      description,
      isbn10,
      isbn13,
      thumbnail,
      authors,
      tags,
      language,
      bookSet,
      bookSetOrder,
    },
    {
      algorithm: 'sha256',
    },
  );
};

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
