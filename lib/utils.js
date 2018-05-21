const hash = require('object-hash');
const sharp = require('sharp');

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

  static async resizeImage(encodedImage, width, height) {
    const buf = Buffer.from(encodedImage.trim(), 'base64');
    try {
      const data = await sharp(buf).resize(width, height)
        .png()
        .toBuffer();
      return data.toString('base64');
    } catch (e) {
      // FIXME:
      // Do nothing, do not insert the corrupted thumbnail
      return '';
    }
  }
}

module.exports = Utils;
