"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.getPropertyDetails = exports.getUserListings = void 0;
const userManagement_1 = require("../services/userManagement");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const listingService = new userManagement_1.ListingService();
const getUserListings = async (req, res, next) => {
    const userId = req.user?.id;
    const query = req.query;
    try {
        const listings = await listingService.getUserListings(userId, query);
        new response_util_1.default(200, true, "User listings fetched successfully", res, listings);
    }
    catch (error) {
        console.error("[getUserListings] error:", error);
        next(error);
    }
};
exports.getUserListings = getUserListings;
const getPropertyDetails = async (req, res, next) => {
    const id = req.params.id;
    try {
        const property = await listingService.getPropertyDetails(id);
        res.status(200).json({
            status: "success",
            data: property,
        });
    }
    catch (error) {
        console.error("[getPropertyDetails] error:", error);
        next(error);
    }
};
exports.getPropertyDetails = getPropertyDetails;
const deleteProperty = async (req, res, next) => {
    const { id } = req.params;
    try {
        await listingService.deleteProperty(id);
        res.status(204).json({
            status: "success",
            data: null,
        });
    }
    catch (error) {
        console.error("[deleteProperty] error:", error);
        next(error);
    }
};
exports.deleteProperty = deleteProperty;
