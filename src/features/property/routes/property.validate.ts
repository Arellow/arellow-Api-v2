
import Joi from 'joi';
import { PropertyCategory, SalesStatus } from '../../../../generated/prisma/enums';


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

  bedrooms: Joi.number().positive().required().min(1),
  bathrooms: Joi.number().positive().required().min(1),
  floors: Joi.number().positive().required().min(1),

  price: Joi.object({
    currency: Joi.string().required().min(1),
    amount: Joi.number().positive().required()
  }),

  squareMeters: Joi.string().required().min(1),

  yearBuilt: Joi.number().positive().required(),

});



export const PropertyCategoryMap = {
  Apartment: "Apartment",
  Bungalow: "Bungalow",
  Duplex: "Duplex",

  Detached_Duplex: "Detached Duplex",
    Semi_Detached_Duplex: "Semi Detached Duplex",
    Fully_Detached_Duplex: "Fully Detached Duplex",

    Maisonette : "Maisonette" ,
    
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





export const PropertyStageMap: Record<string, string> = {
  OffPlanStage: "Off-plan stage",
  CarcassStage: "Carcass stage",
  CompletionStage: "Completion stage",
};

export const PropertyProgressMap: Record<string, string> = {
  Zero: "0% ongoing",
  Ten: "10% ongoing",
  Twenty: "20% ongoing",
  Thirty: "30% ongoing",
  Forty: "40% ongoing",
  Fifty: "50% ongoing",
  Sixty: "60% ongoing",
  Seventy: "70% ongoing",
  Eighty: "80% ongoing",
  Ninety: "90% ongoing",
  OneHundred: "100% ongoing",
};






