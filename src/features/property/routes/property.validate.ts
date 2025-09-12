import { PropertyCategory, PropertyProgress, PropertyStage, SalesStatus } from '@prisma/client';
import Joi from 'joi';


export const createPropertySchema = Joi.object({
  title: Joi.string().required().min(3),
  description: Joi.string().required().min(3),
  category: Joi.string().required().valid(...Object.values(PropertyCategory)),
  features: Joi.array().items(Joi.string().min(1)),
  amenities: Joi.array().items(
    Joi.object({
      name: Joi.string().required().min(1),
      photoUrl: Joi.string().uri().required().min(1)
    })
  ),

  country: Joi.string().required().min(1),
  state: Joi.string().required().min(1),
  city: Joi.string().required().min(1),
  neighborhood: Joi.string().required().min(1),

  bedrooms: Joi.string().required().min(1),
  bathrooms: Joi.string().required().min(1),
  squareMeters: Joi.string().required().min(1),

  floors: Joi.string().required().min(1),
  price: Joi.string().required().min(1),

  location: Joi.object({
    lat: Joi.string().required().min(1),
    lng: Joi.string().required().min(1)
  }),

});


export const createProjectSchema = Joi.object({
  title: Joi.string().required().min(3),
  description: Joi.string().required().min(3),
  category: Joi.string().required().valid(...Object.values(PropertyCategory)),
  features: Joi.array().items(Joi.string().min(1)),
  amenities: Joi.array().items(
    Joi.object({
      name: Joi.string().required().min(1),
      photoUrl: Joi.string().uri().required().min(1)
    })
  ),

  country: Joi.string().required().min(1),
  state: Joi.string().required().min(1),
  city: Joi.string().required().min(1),
  neighborhood: Joi.string().required().min(1),

  bedrooms: Joi.string().required().min(1),
  bathrooms: Joi.string().required().min(1),
  squareMeters: Joi.string().required().min(1),

  floors: Joi.string().required().min(1),
  price: Joi.string().required().min(1),

  location: Joi.object({
    lat: Joi.string().required().min(1),
    lng: Joi.string().required().min(1)
  }),

  isFeatureProperty: Joi.boolean().required(),
  yearBuilt: Joi.string().required().min(1),
  stagePrice: Joi.number().positive().required(),
  stage: Joi.string().required().valid(...Object.values(PropertyStage)),
  progress: Joi.string().required().valid(...Object.values(PropertyProgress)),
});

export const createPropertyRequestSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50),
  userRole: Joi.string().trim().min(3).max(50),
  email: Joi.string().trim().email(),
  phoneNumber: Joi.string().pattern(/^[0-9+\-().\s]{7,15}$/),

  propertyCategory: Joi.string().required().valid(...Object.values(PropertyCategory)),
  title: Joi.string().required().min(3),
  features: Joi.array().items(Joi.string()),
  country: Joi.string().required().min(1),
  state: Joi.string().required().min(1),
  city: Joi.string().required().min(1),
  location: Joi.string().required().min(1),
  numberOfBedrooms: Joi.number().integer().min(1).required(),
  numberOfBathrooms: Joi.number().integer().min(1).required(),
  budget: Joi.number().positive().required(),
  description: Joi.string().required().min(3),

});


export const PropertyCategoryMap = {
  Apartment: "Apartment",
  Bungalow: "Bungalow",
  Duplex: "Duplex",
  Detached_House: "Detached House",
  Semi_detached_House: "Semi-detached House",
  Mansion: "Mansion",
  Penthouse: "Penthouse",
  Studio_Apartment: "Studio Apartment",
  Shared_Apartment: "Shared Apartment",
  Serviced_Apartment: "Serviced Apartment",
  Co_living_Space: "Co-living Space",
  Office_Space: "Office Space",
  Commercial_Property: "Commercial Property",
  Warehouse: "Warehouse",
  Short_let: "Short-let",
  Hostel_Student_Housing: "Hostel / Student Housing",
};



export const changeStatusSchema = Joi.object({
  salesStatus: Joi.string().required().valid(...Object.values(SalesStatus)),
});







