
import { UserRole } from "@prisma/client";

export type User = {
  id: string;
  email: string;
  fullname: string;
  role: UserRole;
  is_verified: boolean
  suspended: boolean
}

