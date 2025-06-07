"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimObjectKeys = trimObjectKeys;
function trimObjectKeys(obj) {
    Object.keys(obj).forEach((key) => {
        const trimmedKey = key.trim();
        if (trimmedKey !== key) {
            obj[trimmedKey] = obj[key];
            delete obj[key];
        }
    });
}
