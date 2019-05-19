import hash from 'object-hash';

// eslint-disable-next-line import/prefer-default-export
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
