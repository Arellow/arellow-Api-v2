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
exports.getRealtorsLeaderboard = void 0;
const appError_1 = require("../../../lib/appError");
const leaderboard_1 = require("../services/leaderboard");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const getRealtorsLeaderboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    try {
        const leaderboard = yield (0, leaderboard_1.getTopRealtorsLeaderboard)();
        new response_util_1.default(200, true, "Top 5 earning realtors leaderboard", res, leaderboard);
    }
    catch (error) {
        console.error("Leaderboard fetch error:", error);
        next(new appError_1.InternalServerError("Failed to fetch leaderboard."));
    }
});
exports.getRealtorsLeaderboard = getRealtorsLeaderboard;
