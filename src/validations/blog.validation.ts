import Joi from 'joi'
export const blogSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  author: Joi.string().required(),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional(),
  socialMediaLinks: Joi.object({
    twitter: Joi.string().optional(),
    linkedin: Joi.string().optional(),
    instagram: Joi.string().optional(),
  }).optional(),
  createdAt: Joi.date().optional()
});
