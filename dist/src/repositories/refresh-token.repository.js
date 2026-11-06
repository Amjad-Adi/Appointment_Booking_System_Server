"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRefreshToken = findRefreshToken;
exports.create = create;
exports.revoke = revoke;
exports.remove = remove;
const postgre_connection_js_1 = require("../databases/postgre-connection.js");
const refresh_token_contract_js_1 = require("../databases/contracts/refresh-token.contract.js");
async function findRefreshToken(hashedRefreshToken) {
    return (await postgre_connection_js_1.pool.query(`SELECT ${refresh_token_contract_js_1.COLUMN_USER_ID} AS ${refresh_token_contract_js_1.ALIAS_COLUMN_USER_ID},${refresh_token_contract_js_1.COLUMN_TOKEN_HASH} AS ${refresh_token_contract_js_1.ALIAS_COLUMN_TOKEN_HASH},${refresh_token_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${refresh_token_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${refresh_token_contract_js_1.COLUMN_EXPIRES_AT_UTC} AS ${refresh_token_contract_js_1.ALIAS_COLUMN_EXPIRES_AT_UTC},${refresh_token_contract_js_1.COLUMN_REVOKED},${refresh_token_contract_js_1.COLUMN_REVOKED_AT_UTC} AS ${refresh_token_contract_js_1.ALIAS_COLUMN_REVOKED_AT_UTC}
                        FROM ${refresh_token_contract_js_1.TABLE_NAME}
                        WHERE ${refresh_token_contract_js_1.COLUMN_TOKEN_HASH}=$1`, [hashedRefreshToken])).rows[0];
}
async function create(refreshToken) {
    return (await postgre_connection_js_1.pool.query(`INSERT INTO ${refresh_token_contract_js_1.TABLE_NAME}(${refresh_token_contract_js_1.COLUMN_USER_ID},${refresh_token_contract_js_1.COLUMN_TOKEN_HASH},${refresh_token_contract_js_1.COLUMN_EXPIRES_AT_UTC})
                    VALUES ($1,$2,$3)
                    RETURNING ${refresh_token_contract_js_1.COLUMN_USER_ID} AS ${refresh_token_contract_js_1.ALIAS_COLUMN_USER_ID},${refresh_token_contract_js_1.COLUMN_TOKEN_HASH} AS ${refresh_token_contract_js_1.ALIAS_COLUMN_TOKEN_HASH},${refresh_token_contract_js_1.COLUMN_CREATED_AT_UTC} AS ${refresh_token_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},${refresh_token_contract_js_1.COLUMN_EXPIRES_AT_UTC} AS ${refresh_token_contract_js_1.ALIAS_COLUMN_EXPIRES_AT_UTC},${refresh_token_contract_js_1.COLUMN_REVOKED},${refresh_token_contract_js_1.COLUMN_REVOKED_AT_UTC} AS ${refresh_token_contract_js_1.ALIAS_COLUMN_REVOKED_AT_UTC}`, [refreshToken.userId, refreshToken.tokenHash, refreshToken.expiresAtUTC])).rows[0];
}
async function revoke(tokenHash) {
    (await postgre_connection_js_1.pool.query(`UPDATE ${refresh_token_contract_js_1.TABLE_NAME}
                        SET ${refresh_token_contract_js_1.COLUMN_REVOKED} = TRUE,
                            ${refresh_token_contract_js_1.COLUMN_REVOKED_AT_UTC} = now()
                        WHERE ${refresh_token_contract_js_1.COLUMN_TOKEN_HASH} = $1`, [tokenHash]));
}
async function remove(tokenHash) {
    (await postgre_connection_js_1.pool.query(`DELETE
         FROM ${refresh_token_contract_js_1.TABLE_NAME}
         WHERE ${refresh_token_contract_js_1.COLUMN_TOKEN_HASH} = $1`, [tokenHash]));
}
