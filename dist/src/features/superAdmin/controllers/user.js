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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersController = void 0;
const user_1 = require("../services/user");
const getUsersController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        const result = yield (0, user_1.getUsersService)(query);
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
});
exports.getUsersController = getUsersController;
