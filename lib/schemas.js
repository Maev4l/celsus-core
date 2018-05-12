const Joi = require('joi');

const librarySchema = Joi.object().keys({
  id: Joi.string().guid({ version: ['uuidv4'] }),
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(512).required(),
});

exports.librarySchema = librarySchema;
