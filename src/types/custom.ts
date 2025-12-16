import { UserRole } from "../../generated/prisma/enums";


export type User = {
  id: string;
  email: string;
  fullname: string;
  role: UserRole;
  is_verified: boolean
  suspended: boolean
}

