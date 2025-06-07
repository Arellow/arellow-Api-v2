import Joi from 'joi';

export const createPropertyRequestSchema = Joi.object({
   name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters long",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),

  phone_number: Joi.string().min(7).max(20).required().messages({
    "string.empty": "Phone number is required",
  }),

  state: Joi.string().required().messages({
    "string.empty": "State is required",
  }),

  property_location: Joi.string().required().messages({
    "string.empty": "Property location is required",
  }),

  neighborhood: Joi.string().allow("", null),

  property_category: Joi.string().required().messages({
    "string.empty": "Property category is required",
  }),

  property_type: Joi.string().required().messages({
    "string.empty": "Property type is required",
  }),

  furnishing_status: Joi.string().valid("furnished", "semi-furnished", "unfurnished").allow("", null),

  number_of_bedrooms: Joi.number().integer().min(0).allow(null),

  number_of_bathrooms: Joi.number().integer().min(0).allow(null),

  budget: Joi.number().min(0).allow(null),

  property_description: Joi.string().max(1000).allow("", null),

  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
}); 