"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userManagement_1 = require("../controllers/userManagement");
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
router.get("/myListings", auth_middleware_1.default, userManagement_1.getUserListings);
router.get("/myListing/:id", auth_middleware_1.default, userManagement_1.getPropertyDetails);
exports.default = router;
