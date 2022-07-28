"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const contactSchema_1 = require("./contactSchema");
const data = __importStar(require("./data.json"));
const body_parser_1 = __importDefault(require("body-parser"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    res.status(404); // using response here
    next(err);
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});
mongoose_1.default.connect(process.env.DB_URL);
//GET
app.get('/contacts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allContacts = yield contactSchema_1.Contact.find({});
    res.send(allContacts);
}));
app.get('/contacts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const foundContact = yield contactSchema_1.Contact.findById(id);
    res.send(foundContact);
}));
app.get('/about', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(data);
}));
//POST
app.post('/contacts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newContact = new contactSchema_1.Contact({
        name: req.body.name,
        surname: req.body.surname,
        nickname: req.body.nickname,
        email: req.body.email,
        bornDate: req.body.bornDate,
        age: req.body.age,
        phoneNumber: req.body.phoneNumber,
        adress: req.body.adress,
    });
    yield newContact.save();
    res.json(newContact);
}));
app.post(`/contacts/:id/mail`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const foundContact = yield contactSchema_1.Contact.findById(id);
    const mailOptions = {
        from: 'teyema1630@hotmail.com',
        to: foundContact.email,
        subject: req.body.subject,
        text: req.body.text,
    };
    const transporter = nodemailer_1.default.createTransport({
        service: 'Hotmail',
        port: 467,
        secure: false,
        auth: {
            user: 'teyema1630@hotmail.com',
            pass: 'Contactera2022',
        },
    });
    yield transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log(mailOptions);
        }
    });
    res.send(mailOptions);
}));
//PUT
app.put(`/contacts/:id`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const contact = yield contactSchema_1.Contact.findByIdAndUpdate(id, req.body, {
        runValidators: true,
        new: true,
    });
    res.send(contact);
}));
//DELETE
app.delete(`/contacts/:id`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedContact = yield contactSchema_1.Contact.findByIdAndDelete(id);
    res.send(deletedContact);
}));
app.listen(3000, () => {
    console.log('Listening on port 3000');
});
