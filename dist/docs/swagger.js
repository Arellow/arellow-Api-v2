"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const server_1 = require("../server");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Arellow Backend API Documentation",
            version: "1.0.0",
            description: "API documentation for the Arellow backend project.",
        },
        servers: [
            {
                url: `http://localhost:${server_1.PORT}`,
                description: "Development server",
            },
            {
                url: `https://arellow-api-v2-4zny0l7qf.vercel.app`,
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
        security: [
            {
                bearerAuth: [],
            },
        ],
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
    apis: ["./src/routes/*.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
