"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpException extends Error {
    constructor(status, message, data = '') {
        super(message);
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
exports.default = HttpException;
