import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';

import { librarySchema as schema } from './schemas';
import CelsusException from './exception';

import { listLibraries, saveLibrary, modifyLibrary, removeLibrary, readLibrary } from './storage';

export const getLibraries = async (userId) => {
  const libraries = await listLibraries(userId);
  return {
    libraries,
  };
};

export const createLibrary = async (userId, library) => {
  const { error } = Joi.validate(library, schema);
  if (error) {
    const { message } = error.details[0];
    throw new CelsusException(message);
  }

  const id = uuidv4();
  await saveLibrary(userId, { ...library, id });

  return {
    id,
  };
};

export const updateLibrary = async (userId, library) => {
  const { error } = Joi.validate(library, schema);
  if (error) {
    const { message } = error.details[0];
    throw new CelsusException(message);
  }

  const rowCount = await modifyLibrary(userId, library);

  return rowCount === 1;
};

export const deleteLibrary = async (userId, libraryId) => {
  const rowCount = await removeLibrary(userId, libraryId);
  return rowCount === 1;
};

export const getLibrary = async (userId, libraryId) => {
  const row = await readLibrary(userId, libraryId);
  return row;
};
