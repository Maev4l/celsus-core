import hash from 'object-hash';

export const hashBook = (book) => {
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

export const LEND_BOOK_VALIDATION_STATUS = Object.freeze({
  BOOK_VALIDATED: 'BOOK_VALIDATED',
  BOOK_NOT_VALIDATED: 'BOOK_NOT_VALIDATED',
});

export const LENDING_STATUS = Object.freeze({
  PENDING: 'PENDING',
});

export const INCOMING_OPERATIONS = Object.freeze({
  VALIDATE_LEND_BOOK: 'VALIDATE_LEND_BOOK',
  CONFIRM_LEND_BOOK: 'CONFIRM_LEND_BOOK',
  CANCEL_LEND_BOOK: 'CANCEL_LEND_BOOK',
  RETURN_LENT_BOOK: 'RETURN_LENT_BOOK',
});

export const OUTGOING_OPERATIONS = Object.freeze({
  VALIDATE_LEND_BOOK: 'VALIDATE_LEND_BOOK',
});
