"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const newC = new mongoose_1.default.Schema({
    name: String,
    surname: String,
    nickname: String,
    email: String,
    bornDate: String,
    age: String,
    phoneNumber: Number,
    adress: String,
});
exports.Contact = mongoose_1.default.model('Contact', newC);
