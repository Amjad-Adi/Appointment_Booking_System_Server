"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const app_2 = require("firebase-admin/app");
const service_account_key_json_1 = __importDefault(require("./config/service-account-key.json"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const app_3 = require("firebase/app");
const firebaseConfig = {
    apiKey: "AIzaSyAaiVYC56TwRWruzyhtH9uWK1PbRwGIero",
    authDomain: "training1-abd2a6d3.firebaseapp.com",
    projectId: "training1-abd2a6d3",
    storageBucket: "training1-abd2a6d3.firebasestorage.app",
    messagingSenderId: "978386790249",
    appId: "1:978386790249:web:926c32a7a501d1054d7ff8",
    measurementId: "G-TMTXFKQXTZ"
};
const firebaseApp = (0, app_3.initializeApp)(firebaseConfig);
(0, app_2.initializeApp)({
    credential: (0, app_2.cert)(service_account_key_json_1.default),
});
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
console.log("[SMTP] Configuration:");
console.log("[SMTP] service: gmail");
console.log("[SMTP] user:", SMTP_USER);
console.log("[SMTP] password configured:", Boolean(SMTP_PASS));
exports.transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    logger: true,
    debug: true,
});
const server = http_1.default.createServer(app_1.app);
server.setTimeout(30000);
server.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running at http://localhost:${process.env.SERVER_PORT}`);
});
