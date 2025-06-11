import { Request, Response, NextFunction } from "express";
import { processImage } from "../../../utils/processImage";
import { PrismaClient, Prisma, Status } from "@prisma/client";
import { trimObjectKeys } from "../../../utils/trim";
import { BadRequestError, DuplicateError, InternalServerError, InvalidError } from "../../../lib/appError";

const prisma = new PrismaClient();

interface PropertyFiles {
  banner?: Express.Multer.File[];
  outside_view_images?: Express.Multer.File[];
  living_room_images?: Express.Multer.File[];
  kitchen_room_images?: Express.Multer.File[];
  primary_room_images?: Express.Multer.File[];
  floor_plan_images?: Express.Multer.File[];
  tour_3d_images?: Express.Multer.File[];
  other_images?: Express.Multer.File[];
  youTube_thumbnail?: Express.Multer.File[];
}

interface PropertyBody {
  category: string;
  title: string;
  description: string;
  property_location: string;
  neighborhood?: string;
  country: string;
  region: string;
  city: string;
  longitude?: string;
  latitude?: string;
  youTube_link?: string;
  status?: string;
  property_type: string;
  listing_type: string;
  property_status: string;
  property_age?: string;
  furnishing?: string;
  parking_spaces?: string;
  total_floors?: string;
  available_floor?: string;
  facing_direction?: string;
  street_width?: string;
  plot_area?: string;
  construction_status?: string;
  possession_status?: string;
  transaction_type?: string;
  ownership_type?: string;
  expected_pricing?: string;
  price_per_sqft?: string;
  booking_amount?: string;
  maintenance_monthly?: string;
  price_negotiable?: boolean | string;
  available_from?: string;
  features?: string | string[];
  amenities?: string | string[];
  distance_between_facility?: string | string[];
  number_of_bedrooms?: string;
  number_of_bathrooms?: string;
  number_of_floors?: string;
  square?: string;
  price?: string;
}

interface ParsedPropertyData {
  number_of_bedrooms: number | null;
  number_of_bathrooms: number | null;
  number_of_floors: number | null;
  square: number | null;
  price: number | null;
  property_age: number | null;
  parking_spaces: number | null;
  total_floors: number | null;
  available_floor: number | null;
  street_width: number | null;
  plot_area: number | null;
  expected_pricing: number | null;
  price_per_sqft: number | null;
  booking_amount: number | null;
  maintenance_monthly: number | null;
  available_from: Date | null;
  price_negotiable: boolean;
}

interface ProcessedImage {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export const CreatePost = async (req: Request<{ userId: string }, {}, PropertyBody>, res: Response, next: NextFunction) => {
  //Validate userId param
  const { userId } = req.params;
  if (!userId) {
    throw new BadRequestError("User ID is required in URL params");
  }

  // Trim all incoming body keys
  try {
    trimObjectKeys(req.body);
  } catch (err) {
    console.error("Trim keys failed:", err);
    throw new InternalServerError("Failed to sanitize input keys");
  }

  // Destructure core fields
  const {
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
    youTube_link,
    status = "selling",
    property_type,
    listing_type,
    property_status,
    property_age,
    furnishing,
    parking_spaces,
    total_floors,
    available_floor,
    facing_direction,
    street_width,
    plot_area,
    construction_status,
    possession_status,
    transaction_type,
    ownership_type,
    expected_pricing,
    price_per_sqft,
    booking_amount,
    maintenance_monthly,
    price_negotiable = false,
    available_from,
  } = req.body;

  // Parse JSON-array fields
  let features: string[] = [];
  let amenities: string[] = [];
  let distance_between_facility: string[] = [];
  
  try {
    const rawFeatures = req.body.features;
    features = Array.isArray(rawFeatures)
      ? rawFeatures
      : rawFeatures
      ? JSON.parse(rawFeatures as string)
      : [];
  } catch (err) {
    console.error("Error parsing features:", err);
    features = [];
  }

  try {
    const rawAmenities = req.body.amenities;
    amenities = Array.isArray(rawAmenities)
      ? rawAmenities
      : rawAmenities
      ? JSON.parse(rawAmenities as string)
      : [];
  } catch (err) {
    console.error("Error parsing amenities:", err);
    amenities = [];
  }

  try {
    distance_between_facility = req.body.distance_between_facility
      ? JSON.parse(req.body.distance_between_facility as string)
      : [];
  } catch (err) {
    console.error("Error parsing distance_between_facility:", err);
    distance_between_facility = [];
  }

  // Parse numeric and date fields
  const toInt = (val: string | undefined, name: string): number | null => {
    if (val == null) return null;
    const n = parseInt(val, 10);
    if (isNaN(n)) throw new Error(`\`${name}\` is not a valid integer`);
    return n;
  };

  const toFloat = (val: string | undefined, name: string): number | null => {
    if (val == null) return null;
    const f = parseFloat(val);
    if (isNaN(f)) throw new Error(`\`${name}\` is not a valid number`);
    return f;
  };

  let parsed: ParsedPropertyData;
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
  } catch (err) {
    console.error("Parsing numeric/date fields failed:", err);
    throw new BadRequestError(
      `Invalid numeric/date field: ${err instanceof Error ? err.message : 'Unknown error'}. Check your inputs.`
    );
  }

  //Destructure file uploads
  const files = req.files as PropertyFiles;
  const {
    banner,
    outside_view_images,
    living_room_images,
    kitchen_room_images,
    primary_room_images,
    floor_plan_images,
    tour_3d_images,
    other_images,
    youTube_thumbnail,
  } = files || {};

  // Process each image array
  const processImages = async (images: Express.Multer.File[] | undefined, label: string): Promise<string[]> => {
    if (!images) return [];
    try {
      const imageArray = images.map(img => ({
        buffer: img.buffer,
        originalname: img.originalname,
        mimetype: img.mimetype,
        size: img.size
      }));
      return await processImage(imageArray);
    } catch (err) {
      console.error(`Processing ${label} failed:`, err);
      throw new Error(`Failed to process ${label}. Make sure files are valid images.`);
    }
  };

  let postImages;
  try {
    postImages = await Promise.all([
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
  } catch (err) {
    throw new BadRequestError(err instanceof Error ? err.message : 'Unknown error processing images');
  }

  const [
    postBanner,
    postOutsideViewImages,
    postLivingRoomImages,
    postKitchenRoomImages,
    postPrimaryRoomImages,
    postFloorPlanImages,
    postTour3DImages,
    postOtherImages,
    postYouTubeThumbnail,
  ] = postImages;

  //Create the project in DB
  try {
    const project = await prisma.project.create({
      data: {
        userId,
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
        youTube_link,
        status: status as Status,
        features,
        amenities,
        distance_between_facility,
        ...parsed,
        outside_view_images: postOutsideViewImages,
        living_room_images: postLivingRoomImages,
        kitchen_room_images: postKitchenRoomImages,
        primary_room_images: postPrimaryRoomImages,
        floor_plan_images: postFloorPlanImages,
        tour_3d_images: postTour3DImages,
        other_images: postOtherImages,
        banner: postBanner[0] || null,
        youTube_thumbnail: postYouTubeThumbnail[0] || null,
        property_type,
        listing_type,
        property_status,
        furnishing,
        facing_direction,
        construction_status,
        possession_status,
        transaction_type,
        ownership_type,
      },
    });

    res.status(201).json({
      status: "success",
      data: project,
      message: "Post created successfully",
      succeeded: true,
    });
  } catch (err) {
    // Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma known error:", err);
      if (err.code === "P2002") {
        throw new DuplicateError(
          `Duplicate field value conflict: ${err.meta?.target}. Make sure values are unique.`
        );
      }
      if (err.code === "P2003") {
        throw new BadRequestError(
          `Foreign key constraint failed: ${err.meta?.field_name}. Check related record exists.`
        );
      }
      throw new BadRequestError(`Database error: ${err.message}`);
    }
    if (err instanceof Prisma.PrismaClientValidationError) {
      console.error("Prisma validation error:", err);
      throw new InvalidError(
        `Validation error: ${err.message}. Check required fields and types.`
      );
    }

    // Unknown error
    console.error("Unexpected error in CreatePost:", err);
    throw new InternalServerError(
      "An unexpected error occurred. Check server logs for details."
    );
  }
};
