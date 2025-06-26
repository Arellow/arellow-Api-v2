"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
class AuthService {
    logout(res) {
        res.clearCookie("login", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: true,
        });
    }
}
exports.AuthService = AuthService;
