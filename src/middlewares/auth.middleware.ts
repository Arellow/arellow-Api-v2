import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { UserRole} from "@prisma/client";
import { Prisma } from "../lib/prisma";


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
    const user = await Prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid user." });
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role , is_verified: user.is_verified, suspended: user.suspended};

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

export const isSuspended = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(403).json({ success: false, message: "Unauthorized: No user data found" });
    return;
  }

  const { suspended } = req.user;

  if (suspended) {
    res.status(403).json({ success: false, message: "Sorry your account is suspended. Contact support" });
    return;
  }

  next();
};

export const requireKyc = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const kyc = await Prisma.kyc.findUnique({
    where: { userId }
  });

  if (!kyc || kyc.status !== 'VERIFIED') {
    return res.status(403).json({ message: 'KYC not completed or not approved' });
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

    if(user.role == "SUPER_ADMIN"){
       next();
    }  else {
      // this will be change to admin permission
      next();
    }
     
  };
}

// 
const PERMISSIONS = {
  KYC: ["create", "read", "update", "delete"],
  PROPERTY: ["create", "read", "update", "delete"],
}

