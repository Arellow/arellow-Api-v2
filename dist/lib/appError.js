"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OkMalformedError = exports.DuplicateError = exports.InvalidError = exports.NotFoundError = exports.ExpectationFailedError = exports.ForbiddenError = exports.UnAuthorizedError = exports.InternalServerError = exports.BadRequestError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'MMCOOPERRORS';
        this.statusCode = statusCode;
        this.isOperational = true;
        this.date = new Date();
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = 'Bad Request', statusCode = 400) {
        super(message, statusCode);
    }
}
exports.BadRequestError = BadRequestError;
class InternalServerError extends AppError {
    constructor(message = 'Something wrong happened.', statusCode = 500) {
        super(message, statusCode);
    }
}
exports.InternalServerError = InternalServerError;
class UnAuthorizedError extends AppError {
    constructor(message = 'Not Authorized access', statusCode = 401) {
        super(message, statusCode);
    }
}
exports.UnAuthorizedError = UnAuthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', statusCode = 403) {
        super(message, statusCode);
    }
}
exports.ForbiddenError = ForbiddenError;
class ExpectationFailedError extends AppError {
    constructor(message = 'Expected inputs were not supplied', statusCode = 417) {
        super(message, statusCode);
    }
}
exports.ExpectationFailedError = ExpectationFailedError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', statusCode = 404) {
        super(message, statusCode);
    }
}
exports.NotFoundError = NotFoundError;
class InvalidError extends AppError {
    constructor(message = 'Invalid Input', statusCode = 422) {
        super(message, statusCode);
    }
}
exports.InvalidError = InvalidError;
class DuplicateError extends AppError {
    constructor(message = 'Duplicate value', statusCode = 406) {
        super(message, statusCode);
    }
}
exports.DuplicateError = DuplicateError;
class OkMalformedError extends AppError {
    constructor(message = 'ok', statusCode = 200) {
        super(message, statusCode);
    }
}
exports.OkMalformedError = OkMalformedError;
