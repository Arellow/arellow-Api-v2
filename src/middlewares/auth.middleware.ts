

import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { PrismaClient , UserRole} from "@prisma/client";
import { User } from "types/custom";

const prisma = new PrismaClient();

export default async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided or malformed token please login" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid user." });
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role };

    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}


export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(403).json({ success: false, message: "Unauthorized: No user data found" });
    return;
  }

  const { role } = req.user;

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    res.status(403).json({ success: false, message: "Access denied: Admins only" });
    return;
  }

  next();
};


export const isSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(403).json({ success: false, message: "Unauthorized: No user data found" });
    return;
  }

  const { role } = req.user;

  if (role !== "SUPER_ADMIN") {
    res.status(403).json({ success: false, message: "Access denied: Superadmins only" });
    return;
  }

  next();
};


export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req?.user; 

    if (!user) {
       res.status(401).json({ success: false, message: "Unauthorized" });
       return
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
       return
    }

    next();
  };
}
