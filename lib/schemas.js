/* eslint-disable newline-per-chained-call */
const Joi = require('joi');

const librarySchema = Joi.object().keys({
  id: Joi.string().guid({ version: ['uuidv4'] }),
  name: Joi.string()
    .min(1)
    .max(100)
    .required(),
  description: Joi.string()
    .max(512)
    .allow('')
    .required(),
});

const bookSchema = Joi.object().keys({
  id: Joi.string().guid({ version: ['uuidv4'] }),
  libraryId: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required(),
  title: Joi.string()
    .min(1)
    .max(100)
    .required(),
  description: Joi.string()
    .max(1024)
    .allow('')
    .required(),
  isbn10: Joi.string()
    .max(30)
    .allow('')
    .regex(
      /^(?:ISBN(?:-10)?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$)[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
    )
    .required(),
  isbn13: Joi.string()
    .max(30)
    .allow('')
    .regex(
      /^(?:ISBN(?:-13)?:? )?(?=[0-9]{13}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)97[89][- ]?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9]$/,
    )
    .required(),
  thumbnail: Joi.string()
    .base64()
    .allow('')
    .required(),
  authors: Joi.array()
    .items(Joi.string())
    .required(),
  tags: Joi.array()
    .items(Joi.string())
    .required(),
  language: Joi.string()
    .valid('fr', 'gb')
    .required(),
  bookSet: Joi.string()
    .max(100)
    .allow('')
    .required(),
});

exports.librarySchema = librarySchema;
exports.bookSchema = bookSchema;
