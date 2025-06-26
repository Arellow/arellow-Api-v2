"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersController = void 0;
const user_1 = require("../services/user");
const getUsersController = async (req, res, next) => {
    try {
        const query = req.query;
        const result = await (0, user_1.getUsersService)(query);
        res.status(200).json({
            status: "success",
            data: result.users,
            total: result.total,
            page: result.page,
            pages: result.pages,
        });
    }
    catch (error) {
        console.error("User fetch failed", error);
        res.status(500).json({
            status: "failed",
            message: error.message || "Internal server error",
        });
    }
};
exports.getUsersController = getUsersController;
