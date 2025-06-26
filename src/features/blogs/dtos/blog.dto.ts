import { Prisma } from "@prisma/client";

export interface CreateBlogDto {
  title: string;
  content: string;
  category: string;
  imageUrl?: string | null; 
}

export interface UpdateBlogDto {
  title?: string;
  content?: string;
  category?: string;
  imageUrl?: string | null;
}

export interface BlogFilterDto {
  category?: "Internal Blog" | "External Blog" | "Campaigns";
  page?: number;
  limit?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null; 
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogResponse {
  data: BlogPost[];
  totalCount: number;
}