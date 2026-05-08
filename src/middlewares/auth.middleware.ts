import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { Prisma } from "../lib/prisma";
import { UserRole , ActionRole} from "../../generated/prisma/enums";


// Lightweight: trusts the JWT payload — no DB lookup.
// Use this on every route. For routes that need guaranteed-fresh suspension /
// verification status, chain `authenticateFresh` after `authenticate`.
export function isLoginUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req?.headers?.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    // Session tokens include role/suspended/is_verified; verification-only tokens
    // (email confirm, password reset) only have userId+email — skip those.
    if (decoded.role) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        suspended: decoded.suspended,
        is_verified: decoded.is_verified,
        fullname: decoded.fullname,
      };
    }
    next();
  } catch {
    res.status(401).json({ success: false, message: "Token verification failed" });
  }
}


export default async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(403).json({ success: false, message: "Unauthorized: No user data found" });
    return;
  }
  next();
}

// Use after `authenticate` on routes that need guaranteed-fresh DB state
// (e.g. re-checking suspension before a financial action).
export async function authenticateFresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(403).json({ success: false, message: "Unauthorized: No user data found" });
    return;
  }

  try {
    const user = await Prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized: User not found" });
      return;
    }
    req.user = { id: user.id, email: user.email, role: user.role, is_verified: user.is_verified, suspended: user.suspended, fullname: user.fullname };
    next();
  } catch {
    res.status(500).json({ success: false, message: "Internal server error" });
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

export const isVerify = (req: Request, res: Response, next: NextFunction): void => {
  const is_user_verified = req.user?.is_verified!;
  if (!is_user_verified) {
    res.status(403).json({ success: false, message: "Unauthorized: User email not verified" });
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


export const rejectSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(403).json({ success: false, message: "Unauthorized: No user data found" });
    return;
  }

  const { role } = req.user;

  if (role === "SUPER_ADMIN") {
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

    return next()
     
  };
}


export const adminRequireRole = (...allowedRoles: ActionRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req?.user;
  

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }


    if(user?.role == UserRole.SUPER_ADMIN){
        return next();
    }

    try {
      const adminPermission = await Prisma.adminPermission.findUnique({
        where: { userId: user.id },
      });

      if (!adminPermission || !adminPermission.action.length) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: no admin permissions found",
        });
      }

      const hasAccess = adminPermission.action.some((role) =>
        allowedRoles.includes(role)
      );

      if (!hasAccess) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: insufficient role" });
      }

  
      return next();
    } catch (error) {
      // console.error("adminRequireRole error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };
};



