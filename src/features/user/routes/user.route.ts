import { Router } from "express";
import {
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  suspendUser,
} from "../controllers/user";
import authenticate from "../../../middlewares/auth.middleware";
import { validateSchema } from "../../../middlewares/propertyParsingAndValidation";
import { updateUserSchema } from "../../../validations/user.validation";

const usersRoutes = Router();
usersRoutes.get("/:userId", getUserById);
usersRoutes.patch(
  "/:userId",
  authenticate,
  validateSchema(updateUserSchema),
  updateUser
);
usersRoutes.put("/:userId/role", authenticate, updateUserRole);
usersRoutes.put("/:userId/suspend", suspendUser);
usersRoutes.delete("/:userId", deleteUser);

export default usersRoutes;
