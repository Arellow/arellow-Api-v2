"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
// import './types/express';
const express_1 = __importDefault(require("express"));
const index_middleware_1 = __importDefault(require("./middlewares/index.middleware"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./docs/swagger"));
const errors_middleware_1 = __importDefault(require("./middlewares/errors.middleware"));
const app = (0, express_1.default)();
(0, index_middleware_1.default)(app);
app.use("/arellow-swagger", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.use("/", (req, res) => {
    res.send("welcome to arellow");
});
// Custom error handling middleware - moved after routes
app.use(errors_middleware_1.default);
exports.default = app;
