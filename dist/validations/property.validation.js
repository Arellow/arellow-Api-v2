"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPropertySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createPropertySchema = joi_1.default.object({
    category: joi_1.default.string().required(),
    title: joi_1.default.string().required().min(3).max(100),
    description: joi_1.default.string().required().min(10).max(2000),
    neighborhood: joi_1.default.string().optional(),
    features: joi_1.default.array().items(joi_1.default.string()),
    amenities: joi_1.default.array().items(joi_1.default.string()),
    distance_between_facility: joi_1.default.array()
        .items(joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.number().min(0)))
        .default([]),
    property_location: joi_1.default.string().optional(),
    property_type: joi_1.default.string().required(),
    listing_type: joi_1.default.string().required(),
    property_status: joi_1.default.string().required(),
    furnishing: joi_1.default.string().allow(null, ''),
    facing_direction: joi_1.default.string().allow(null, ''),
    construction_status: joi_1.default.string().allow(null, ''),
    possession_status: joi_1.default.string().allow(null, ''),
    transaction_type: joi_1.default.string().allow(null, ''),
    ownership_type: joi_1.default.string().allow(null, ''),
    youTube_link: joi_1.default.string().uri().allow(null, ''),
    longitude: joi_1.default.string().allow(null, ''),
    latitude: joi_1.default.string().allow(null, ''),
    country: joi_1.default.string().allow(null, ''),
    region: joi_1.default.string().allow(null, ''),
    city: joi_1.default.string().allow(null, ''),
    number_of_bedrooms: joi_1.default.number().min(0),
    number_of_bathrooms: joi_1.default.number().min(0),
    number_of_floors: joi_1.default.number().min(0),
    square: joi_1.default.number().min(0),
    price: joi_1.default.alternatives().try(joi_1.default.number().min(0), joi_1.default.string()),
    property_age: joi_1.default.number().min(0),
    parking_spaces: joi_1.default.number().min(0),
    total_floors: joi_1.default.number().min(0),
    available_floor: joi_1.default.number().min(0),
    street_width: joi_1.default.number().min(0),
    plot_area: joi_1.default.number().min(0),
    expected_pricing: joi_1.default.number().min(0),
    price_per_sqft: joi_1.default.number().min(0),
    booking_amount: joi_1.default.number().min(0),
    maintenance_monthly: joi_1.default.number().min(0),
    price_negotiable: joi_1.default.boolean().default(false),
    available_from: joi_1.default.date().allow(null),
});
