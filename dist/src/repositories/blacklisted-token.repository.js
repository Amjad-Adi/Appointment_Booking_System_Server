"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBlacklistedToken = findBlacklistedToken;
exports.create = create;
const postgre_connection_js_1 = require("../databases/postgre-connection.js");
const blacklisted_token_contract_js_1 = require("../databases/contracts/blacklisted-token.contract.js");
async function findBlacklistedToken(jti) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${blacklisted_token_contract_js_1.COLUMN_JTI} ,${blacklisted_token_contract_js_1.COLUMN_EXPIRES_AT_UTC} AS ${blacklisted_token_contract_js_1.ALIAS_COLUMN_EXPIRES_AT_UTC},${blacklisted_token_contract_js_1.COLUMN_BLACKLISTED_AT_UTC} AS ${blacklisted_token_contract_js_1.ALIAS_COLUMN_BLACKLISTED_AT_UTC},${blacklisted_token_contract_js_1.COLUMN_REASON}
                        FROM ${blacklisted_token_contract_js_1.TABLE_NAME}
                        WHERE ${blacklisted_token_contract_js_1.COLUMN_JTI}=$1 AND ${blacklisted_token_contract_js_1.COLUMN_EXPIRES_AT_UTC} > now()`, [jti])).rows[0];
}
async function create(blacklistedToken) {
    return (await postgre_connection_js_1.pool.query(`INSERT INTO ${blacklisted_token_contract_js_1.TABLE_NAME}(${blacklisted_token_contract_js_1.COLUMN_JTI},${blacklisted_token_contract_js_1.COLUMN_EXPIRES_AT_UTC},${blacklisted_token_contract_js_1.COLUMN_REASON})
                    VALUES ($1,$2,$3)
                    RETURNING ${blacklisted_token_contract_js_1.COLUMN_JTI} ,${blacklisted_token_contract_js_1.COLUMN_EXPIRES_AT_UTC} AS ${blacklisted_token_contract_js_1.ALIAS_COLUMN_EXPIRES_AT_UTC},${blacklisted_token_contract_js_1.COLUMN_BLACKLISTED_AT_UTC} AS ${blacklisted_token_contract_js_1.ALIAS_COLUMN_BLACKLISTED_AT_UTC},${blacklisted_token_contract_js_1.COLUMN_REASON}`, [blacklistedToken.jti, blacklistedToken.expiresAtUTC, blacklistedToken.reason])).rows[0];
}
