"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArrayFields = parseArrayFields;
exports.validateSchema = validateSchema;
function parseArrayFields(fields) {
    return (req, res, next) => {
        fields.forEach((field) => {
            if (req.body[field]) {
                try {
                    req.body[field] = JSON.parse(req.body[field]);
                }
                catch {
                    req.body[field] = req.body[field]
                        .split(",")
                        .map((item) => item.trim());
                }
            }
        });
        next();
    };
}
function validateSchema(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(", ");
            res.status(400).json({ status: "error", message: errorMessage });
            return;
        }
        next();
    };
}
