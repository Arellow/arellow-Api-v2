import Joi from 'joi'
export const blogSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'Title is required',
  }),
  content: Joi.string().required().messages({
    'string.empty': 'Content is required',
  }),
  author: Joi.string().required().messages({
    'string.empty': 'Author is required',
  }),
  category: Joi.string().valid('Internal Blog', 'External Blog').required().messages({
    'any.only': 'Category must be "Internal Blog" or "External Blog"',
  }),
  imageUrlInput: Joi.string().uri().optional(),
  socialMediaLinks: Joi.array().items(Joi.string().uri()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  createdAt: Joi.date().optional(),
});