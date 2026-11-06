"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === 'production';
exports.pool = isProduction
    ? new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    })
    : new pg_1.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
exports.pool.connect((err, client, release) => {
    if (err) {
        console.error(`Error connecting to ${isProduction ? 'Neon' : 'local PostgreSQL'}:`, err);
        return;
    }
    console.log(`Connected to ${isProduction ? 'Neon' : 'local PostgreSQL'}`);
    release();
});
