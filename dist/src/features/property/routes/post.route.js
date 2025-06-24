"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FetchProperties_1 = require("../controllers/FetchProperties");
const auth_middleware_1 = __importStar(require("../../../middlewares/auth.middleware"));
const request_1 = require("../../requestProperties/controllers/request");
const seedPropImages_1 = require("../controllers/seedPropImages");
const properties_1 = require("../controllers/properties");
const client_1 = require("@prisma/client");
const propertyRoutes = express_1.default.Router();
propertyRoutes.get("/featured", FetchProperties_1.getFeaturedProjects);
propertyRoutes.get("/recent", FetchProperties_1.getRecentProjects);
// propertyRoutes.post("/like", authenticate, toggleProjectLike );
propertyRoutes.post("/seed", seedPropImages_1.seedNigerianStates);
propertyRoutes.get("/seed", seedPropImages_1.getAllStates);
propertyRoutes.post("/mortgage/:id", auth_middleware_1.default, FetchProperties_1.calculateProjectMortgage);
//Request property
propertyRoutes.post("/requestProperty", auth_middleware_1.default, request_1.createPropertyRequest);
// undocumented on postman
propertyRoutes.post("/createproperty", auth_middleware_1.default, request_1.createPropertyRequest);
propertyRoutes.post("/:id/like", auth_middleware_1.default, properties_1.likeProperty);
propertyRoutes.delete('/:id/like', auth_middleware_1.default, properties_1.unLikeProperty);
propertyRoutes.get("/:id", properties_1.singleProperty);
propertyRoutes.patch("/:id/approve", auth_middleware_1.default, (0, auth_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), properties_1.approveProperty);
propertyRoutes.patch("/:id/reject", auth_middleware_1.default, (0, auth_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), properties_1.rejectProperty);
propertyRoutes.patch("/:id/archive", auth_middleware_1.default, properties_1.archiveProperty);
propertyRoutes.patch("/:id/unarchive", auth_middleware_1.default, properties_1.unArchiveProperty);
propertyRoutes.patch("/:id/status", auth_middleware_1.default, properties_1.statusProperty);
propertyRoutes.delete("/:id", auth_middleware_1.default, (0, auth_middleware_1.requireRole)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN), properties_1.deleteProperty);
propertyRoutes.get("/liked", auth_middleware_1.default, properties_1.getLikedPropertiesByUser);
propertyRoutes.get("/user", auth_middleware_1.default, properties_1.getPropertiesByUser);
propertyRoutes.patch("/:propertyId/media", auth_middleware_1.default, properties_1.mediaForProperty);
exports.default = propertyRoutes;
