// import Joi from "joi";

// export const mortgageCalculatorSchema = Joi.object({
//   home_location: Joi.string().required(),

//   home_price: Joi.number().positive().required(),

//   down_payment: Joi.number()
//     .required()
//     .custom((value, helpers) => {
//       const { home_price } = helpers.state.ancestors[0];
//       const minimum = home_price * 0.2;
//       if (value < minimum) {
//         return helpers.message(
//           `Down payment must be at least 20% of home price (₦${minimum.toLocaleString()})`
//         );
//       }
//       return value;
//     }),

//   loan_type: Joi.string().optional().default("30-year fixed"),


//   loan_term_years: Joi.number().integer().positive().optional().default(20),

//   property_tax: Joi.number().valid(1.5).positive().optional().default(1.5).messages({
//     "any.only": "property tax is fixed at 1.5",
//   }),


//   home_insurance: Joi.number()
//     .valid(0.5)
//     .optional()
//     .messages({
//       "any.only": "Home insurance must be exactly 0.5 (%) of the home price",
//     }),

//   hoa_fees: Joi.number().min(0).optional().default(0),

//   mortgage_insurance: Joi.number().min(0).optional().default(0),
// });

