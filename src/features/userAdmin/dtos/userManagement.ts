import { PropertyStatus } from "@prisma/client";

export interface ListingQueryDto {
  country?: string;
  state?: string;
  search?: string;
  page?: number;
  limit?: number;
  isapproved?: PropertyStatus;
}

export interface ListingResponseDto {
  id: string;
  propertyName: string | null;
  propertyType: string | null;
  price: number | null;
  location: string | null;
  listingDate: Date;
  propertyImage: string | null;
  status: PropertyStatus;
  totalCount: number;
}

export interface PropertyResponseDto {
  id: string;
  category?: string | null;
  title?: string | null;
  description?: string | null;
  features: string[];
  amenities: string[];
  neighborhood?: string | null;
  number_of_bedrooms?: string | null;
  number_of_bathrooms?: string | null;
  number_of_floors?: number | null;
  square?: string | null;
  price?: number | null;
  longitude?: string | null;
  latitude?: string | null;
  country?: string | null;
  city?: string | null;
  views: number;
  archive: boolean;
  status: "selling" | "rent" | "sold";
  isapproved: PropertyStatus;
  rejectreason?: string | null;
  createdAt: Date;
}