"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDetail = void 0;
const userDetails_1 = require("../services/userDetails");
const appError_1 = require("../../../lib/appError");
const agentService = new userDetails_1.AgentService();
const userDetail = async (req, res, next) => {
    const userId = req.params.userId;
    if (!userId) {
        throw new appError_1.BadRequestError("User not authenticated");
    }
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 3);
    try {
        // const data = await agentService.getAgentDetail(userId, page, limit);
        //  new CustomResponse(
        //   200,
        //   true,
        //    "Agent details fetched successfully",
        //   res,
        //   data,
        // );
    }
    catch (error) {
        next(error);
    }
};
exports.userDetail = userDetail;
