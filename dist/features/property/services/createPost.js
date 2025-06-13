"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePost = void 0;
const processImage_1 = require("../../../utils/processImage");
const client_1 = require("@prisma/client");
const trim_1 = require("../../../utils/trim");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
const CreatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    //Validate userId param
    const { userId } = req.params;
    if (!userId) {
        throw new appError_1.BadRequestError("User ID is required in URL params");
    }
    // Trim all incoming body keys
    try {
        (0, trim_1.trimObjectKeys)(req.body);
    }
    catch (err) {
        console.error("Trim keys failed:", err);
        throw new appError_1.InternalServerError("Failed to sanitize input keys");
    }
    // Destructure core fields
    const { category, title, description, property_location, neighborhood, country, region, city, longitude, latitude, youTube_link, status = "selling", property_type, listing_type, property_status, property_age, furnishing, parking_spaces, total_floors, available_floor, facing_direction, street_width, plot_area, construction_status, possession_status, transaction_type, ownership_type, expected_pricing, price_per_sqft, booking_amount, maintenance_monthly, price_negotiable = false, available_from, } = req.body;
    // Parse JSON-array fields
    let features = [];
    let amenities = [];
    let distance_between_facility = [];
    try {
        const rawFeatures = req.body.features;
        features = Array.isArray(rawFeatures)
            ? rawFeatures
            : rawFeatures
                ? JSON.parse(rawFeatures)
                : [];
    }
    catch (err) {
        console.error("Error parsing features:", err);
        features = [];
    }
    try {
        const rawAmenities = req.body.amenities;
        amenities = Array.isArray(rawAmenities)
            ? rawAmenities
            : rawAmenities
                ? JSON.parse(rawAmenities)
                : [];
    }
    catch (err) {
        console.error("Error parsing amenities:", err);
        amenities = [];
    }
    try {
        distance_between_facility = req.body.distance_between_facility
            ? JSON.parse(req.body.distance_between_facility)
            : [];
    }
    catch (err) {
        console.error("Error parsing distance_between_facility:", err);
        distance_between_facility = [];
    }
    // Parse numeric and date fields
    const toInt = (val, name) => {
        if (val == null)
            return null;
        const n = parseInt(val, 10);
        if (isNaN(n))
            throw new Error(`\`${name}\` is not a valid integer`);
        return n;
    };
    const toFloat = (val, name) => {
        if (val == null)
            return null;
        const f = parseFloat(val);
        if (isNaN(f))
            throw new Error(`\`${name}\` is not a valid number`);
        return f;
    };
    let parsed;
    try {
        parsed = {
            number_of_bedrooms: toInt(req.body.number_of_bedrooms, "number_of_bedrooms"),
            number_of_bathrooms: toInt(req.body.number_of_bathrooms, "number_of_bathrooms"),
            number_of_floors: toInt(req.body.number_of_floors, "number_of_floors"),
            square: toFloat(req.body.square, "square"),
            price: toFloat(req.body.price, "price"),
            property_age: property_age ? toInt(property_age, "property_age") : null,
            parking_spaces: parking_spaces ? toInt(parking_spaces, "parking_spaces") : null,
            total_floors: total_floors ? toInt(total_floors, "total_floors") : null,
            available_floor: available_floor ? toInt(available_floor, "available_floor") : null,
            street_width: street_width ? toFloat(street_width, "street_width") : null,
            plot_area: plot_area ? toFloat(plot_area, "plot_area") : null,
            expected_pricing: expected_pricing ? toFloat(expected_pricing, "expected_pricing") : null,
            price_per_sqft: price_per_sqft ? toFloat(price_per_sqft, "price_per_sqft") : null,
            booking_amount: booking_amount ? toFloat(booking_amount, "booking_amount") : null,
            maintenance_monthly: maintenance_monthly ? toFloat(maintenance_monthly, "maintenance_monthly") : null,
            available_from: available_from ? new Date(available_from) : null,
            price_negotiable: price_negotiable === "true" || price_negotiable === true,
        };
        if (parsed.available_from && isNaN(parsed.available_from.getTime())) {
            throw new Error("available_from is not a valid date");
        }
    }
    catch (err) {
        console.error("Parsing numeric/date fields failed:", err);
        throw new appError_1.BadRequestError(`Invalid numeric/date field: ${err instanceof Error ? err.message : 'Unknown error'}. Check your inputs.`);
    }
    //Destructure file uploads
    const files = req.files;
    const { banner, outside_view_images, living_room_images, kitchen_room_images, primary_room_images, floor_plan_images, tour_3d_images, other_images, youTube_thumbnail, } = files || {};
    // Process each image array
    const processImages = (images, label) => __awaiter(void 0, void 0, void 0, function* () {
        if (!images)
            return [];
        try {
            const imageArray = images.map(img => ({
                buffer: img.buffer,
                originalname: img.originalname,
                mimetype: img.mimetype,
                size: img.size
            }));
            return yield (0, processImage_1.processImage)(imageArray);
        }
        catch (err) {
            console.error(`Processing ${label} failed:`, err);
            throw new Error(`Failed to process ${label}. Make sure files are valid images.`);
        }
    });
    let postImages;
    try {
        postImages = yield Promise.all([
            processImages(banner, "banner"),
            processImages(outside_view_images, "outside_view_images"),
            processImages(living_room_images, "living_room_images"),
            processImages(kitchen_room_images, "kitchen_room_images"),
            processImages(primary_room_images, "primary_room_images"),
            processImages(floor_plan_images, "floor_plan_images"),
            processImages(tour_3d_images, "tour_3d_images"),
            processImages(other_images, "other_images"),
            processImages(youTube_thumbnail, "youTube_thumbnail"),
        ]);
    }
    catch (err) {
        throw new appError_1.BadRequestError(err instanceof Error ? err.message : 'Unknown error processing images');
    }
    const [postBanner, postOutsideViewImages, postLivingRoomImages, postKitchenRoomImages, postPrimaryRoomImages, postFloorPlanImages, postTour3DImages, postOtherImages, postYouTubeThumbnail,] = postImages;
    //Create the project in DB
    try {
        const project = yield prisma.project.create({
            data: Object.assign(Object.assign({ userId,
                category,
                title,
                description,
                property_location,
                neighborhood,
                country,
                region,
                city,
                longitude,
                latitude,
                youTube_link, status: status, features,
                amenities,
                distance_between_facility }, parsed), { outside_view_images: postOutsideViewImages, living_room_images: postLivingRoomImages, kitchen_room_images: postKitchenRoomImages, primary_room_images: postPrimaryRoomImages, floor_plan_images: postFloorPlanImages, tour_3d_images: postTour3DImages, other_images: postOtherImages, banner: postBanner[0] || null, youTube_thumbnail: postYouTubeThumbnail[0] || null, property_type,
                listing_type,
                property_status,
                furnishing,
                facing_direction,
                construction_status,
                possession_status,
                transaction_type,
                ownership_type }),
        });
        res.status(201).json({
            status: "success",
            data: project,
            message: "Post created successfully",
            succeeded: true,
        });
    }
    catch (err) {
        // Prisma errors
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma known error:", err);
            if (err.code === "P2002") {
                throw new appError_1.DuplicateError(`Duplicate field value conflict: ${(_a = err.meta) === null || _a === void 0 ? void 0 : _a.target}. Make sure values are unique.`);
            }
            if (err.code === "P2003") {
                throw new appError_1.BadRequestError(`Foreign key constraint failed: ${(_b = err.meta) === null || _b === void 0 ? void 0 : _b.field_name}. Check related record exists.`);
            }
            throw new appError_1.BadRequestError(`Database error: ${err.message}`);
        }
        if (err instanceof client_1.Prisma.PrismaClientValidationError) {
            console.error("Prisma validation error:", err);
            throw new appError_1.InvalidError(`Validation error: ${err.message}. Check required fields and types.`);
        }
        // Unknown error
        console.error("Unexpected error in CreatePost:", err);
        throw new appError_1.InternalServerError("An unexpected error occurred. Check server logs for details.");
    }
});
exports.CreatePost = CreatePost;
