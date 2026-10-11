import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

export const pool = new Pool(
    process.env.NODE_ENV === "production"
        ? {
            connectionString: process.env.DATABASE_PRODUCTION_URL,
            ssl: {
                rejectUnauthorized: false,
            },
        }
        : {
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        }
);