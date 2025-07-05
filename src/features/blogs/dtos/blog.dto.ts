import { UserRole } from '@prisma/client';

export interface CreateBlogDto {
  title: string;
  content: string;
  category: "Internal Blog" | "External Blog";
  imageUrl?: string | null;
  author?: string; 
  tags?: string[]; 
   socialMediaLinks?: string[]
}

export interface UpdateBlogDto {
  title?: string;
  isPublished?: boolean;
  content?: string;
  category?: "Internal Blog" | "External Blog";
  imageUrl?: string | null;
   author?: string
}

export interface FeaturedContributor {
  id: string;
  userId: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  timeToRead?: number; 
  category: string
  isPublished: boolean;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  socialMediaLinks?: string[]
  author?: string;
  authorAvatar?: string | null;
  featuredContributors?: FeaturedContributor[];
}



