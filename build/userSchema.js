"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const passport_local_mongoose_1 = __importDefault(require("passport-local-mongoose"));
const newU = new mongoose_1.default.Schema({
    email: String,
    username: String,
    password: String,
});
newU.plugin(passport_local_mongoose_1.default);
exports.User = mongoose_1.default.model('User', newU);
