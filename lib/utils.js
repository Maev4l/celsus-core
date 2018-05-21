const hash = require('object-hash');

class Utils {
  static hashBook(book) {
    const {
      libraryId, title, description, isbn10, isbn13, thumbnail, authors, tags,
    } = book;

    return hash({
      libraryId, title, description, isbn10, isbn13, thumbnail, authors, tags,
    }, {
      algorithm: 'sha256',
    });
  }
}

module.exports = Utils;
