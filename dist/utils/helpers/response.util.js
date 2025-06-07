"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Response {
    constructor(code, success, message, res, data) {
        this.code = code;
        this.success = success;
        this.message = message;
        this.data = data;
        this.res = res;
        this.sendResponse(res);
    }
    sendResponse(res) {
        if (this.data) {
            return res.status(this.code).send({
                success: this.success,
                message: this.message,
                data: this.data
            });
        }
        else {
            return res.status(this.code).send({
                success: this.success,
                message: this.message
            });
        }
    }
}
exports.default = Response;
