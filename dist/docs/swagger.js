"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const constants_util_1 = require("../utils/constants.util");
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Arellow Backend API Documentation",
            version: "1.0.0",
            description: "API documentation for the Arellow backend project.",
        },
        servers: [
            {
                url: `http://localhost:${constants_util_1.PORT}`,
                description: "Development server",
            },
            {
                url: `https://arellow-api-v2.vercel.app/`,
                description: "Production Vercel server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "Bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        paths: {
            "/api/auth/register": {
                post: {
                    summary: "Register a new user",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        email: { type: "string" },
                                        password: { type: "string" },
                                    },
                                    required: ["name", "email", "password"],
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: "User registered successfully",
                        },
                        400: {
                            description: "Bad request",
                        },
                    },
                },
            },
            "/api/auth/login": {
                post: {
                    summary: "Login a user",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        email: { type: "string" },
                                        password: { type: "string" },
                                    },
                                    required: ["email", "password"],
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: "User logged in successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            token: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                        401: {
                            description: "Unauthorized",
                        },
                    },
                },
            },
        },
    },
    apis: ['src/features/**/*.ts', 'src/server.ts']
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
exports.default = swaggerSpec;
