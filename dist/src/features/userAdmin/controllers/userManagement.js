"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserListings = void 0;
const userManagement_1 = require("../services/userManagement");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const listingService = new userManagement_1.ListingService();
const getUserListings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const query = req.query;
    try {
        const listings = yield listingService.getUserListings(userId, query);
        new response_util_1.default(200, true, "User listings fetched successfully", res, listings);
    }
    catch (error) {
        console.error("[getUserListings] error:", error);
        next(error);
    }
});
exports.getUserListings = getUserListings;
// export const getPropertyDetails = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const  id  = req.params.id as string; 
//   try {
//     const property = await listingService.getPropertyDetails(id );
//     res.status(200).json({
//       status: "success",
//       data: property,
//     });
//   } catch (error) {
//     console.error("[getPropertyDetails] error:", error);
//     next(error);
//   }
// };
// export const deleteProperty = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const { id } = req.params
//   try {
//     await listingService.deleteProperty( id );
//     res.status(204).json({
//       status: "success",
//       data: null,
//     });
//   } catch (error) {
//     console.error("[deleteProperty] error:", error);
//     next(error);
//   }
// };
