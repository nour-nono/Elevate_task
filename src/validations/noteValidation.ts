import Joi from 'joi';

export const createNoteSchema = Joi.object({
  title: Joi.string().min(1).max(200).trim().required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  content: Joi.string().min(1).trim().required().messages({
    'string.empty': 'Content is required',
    'any.required': 'Content is required',
  }),
});

export const deleteNoteSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      'string.hex': 'Note ID must be a valid ObjectId',
      'string.length': 'Note ID must be a valid ObjectId',
      'any.required': 'Note ID is required',
    }),
});
