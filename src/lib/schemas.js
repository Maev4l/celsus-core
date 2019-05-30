import Joi from 'joi';

export const librarySchema = Joi.object().keys({
  id: process.env.development ? Joi.string() : Joi.string().guid({ version: ['uuidv4'] }),
  name: Joi.string()
    .min(1)
    .max(100)
    .required(),
  description: Joi.string()
    .max(512)
    .allow('')
    .required(),
});

export const bookSchema = Joi.object().keys({
  id: process.env.development ? Joi.string() : Joi.string().guid({ version: ['uuidv4'] }),
  libraryId: process.env.development
    ? Joi.string()
    : Joi.string()
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
  bookSetOrder: Joi.when('bookSet', {
    is: '',
    then: Joi.number()
      .valid(0)
      .required(),
    otherwise: Joi.number()
      .positive()
      .required(),
  }),
  lendingId: process.env.development ? Joi.string() : Joi.string().guid({ version: ['uuidv4'] }),
});
