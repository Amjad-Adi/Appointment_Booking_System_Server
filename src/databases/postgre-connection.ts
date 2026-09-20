import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const connectionString=process.env.NODE_ENV === "production" ? process.env.DATABASE_DEPLOYMENT_URL :process.env.DATABASE_DEVELOPMENT_URL;
export const pool = new Pool({
    connectionString:connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});