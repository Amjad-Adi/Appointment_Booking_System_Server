"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drizzleConnection = void 0;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const postgre_connection_js_1 = require("./postgre-connection.js");
exports.drizzleConnection = (0, node_postgres_1.drizzle)(postgre_connection_js_1.pool);
