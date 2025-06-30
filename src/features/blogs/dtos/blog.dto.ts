export interface BlogDTO {
  title: string;
  content: string;
  author: string; // Added to match controller usage
  category: "Internal Blog" | "External Blog"; // Added to match controller validation
  imageUrl?: string | null; // Changed to string | null to match controller logic
  socialMediaLinks?: string[];
  tags: string[];
  createdAt?: Date;
}