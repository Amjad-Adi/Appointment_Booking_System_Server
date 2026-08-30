import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {pool} from "./postgre-connection.js";

export const drizzleConnection = drizzle(pool);