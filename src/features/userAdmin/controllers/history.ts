import { Request, Response, NextFunction } from "express";
// import { EarningHistoryService } from "../services/history";
import { InternalServerError } from "../../../lib/appError";
import { EarningHistoryFilterDto } from "../dtos/history.dto";
// const earningHistoryService = new EarningHistoryService();

// export const getEarningSummary = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.user?.id as string;

//   if (!userId) {
//     res.status(401).json({
//       status: "failed",
//       message: "Unauthorized access",
//       succeeded: false,
//     });
//     return;
//   }

//   try {
//     const summary = await earningHistoryService.getEarningSummary(userId);
//     res.status(200).json({ status: "success", data: summary });
//     return;
//   } catch (error) {
//     next(new InternalServerError("Failed to fetch earning summary."));
//   }
// };

// export const getEarningHistory = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.user?.id as string;

//   if (!userId) {
//      res.status(401).json({
//       status: "failed",
//       message: "Unauthorized access",
//       succeeded: false,
      
//     });
//     return;

//   }

//   try {
//     const filter: EarningHistoryFilterDto = {
//       date: req.query.date ? new Date(req.query.date as string) : undefined,
//       propertyCategory: req.query.propertyCategory as string,
//       country: req.query.country as string,
//       propertyState: req.query.propertyState as string,
//       search: req.query.search as string,
//       page: req.query.page ? parseInt(req.query.page as string) : 1,
//       limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
//     };
//     const history = await earningHistoryService.getEarningHistory(
//       userId,
//       filter
//     );
//     res.status(200).json({ status: "success", data: history });
//   } catch (error) {
//     next(new InternalServerError("Failed to fetch earning history."));
//   }
// };
