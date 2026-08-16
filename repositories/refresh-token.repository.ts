import {pool} from "../databases/postgre-connection"
import {
    COLUMN_EXPIRES_AT_UTC,
    COLUMN_REVOKED_AT_UTC,
    COLUMN_REVOKED,
    COLUMN_TOKEN_HASH, TABLE_NAME, COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_CREATED_AT_UTC, ALIAS_COLUMN_REVOKED_AT_UTC, ALIAS_COLUMN_TOKEN_HASH, ALIAS_COLUMN_USER_ID,
    ALIAS_COLUMN_EXPIRES_AT_UTC, COLUMN_USER_ID
} from "../databases/contracts/refresh-token.contract"
import {CreateRefreshToken, RefreshToken} from "../models/refresh-token.model";
import {BlacklistedToken} from "../models/blacklisted-token.model";
import {
    ALIAS_COLUMN_BLACKLISTED_AT_UTC,
    COLUMN_BLACKLISTED_AT_UTC,
    COLUMN_JTI, COLUMN_REASON
} from "../databases/contracts/blacklisted-token.contract";

export async function findRefreshToken(hashedRefreshToken:string):Promise<RefreshToken>{
    return (await pool.query(
        `SELECT ${COLUMN_USER_ID} AS ${ALIAS_COLUMN_USER_ID},${COLUMN_TOKEN_HASH} AS ${ALIAS_COLUMN_TOKEN_HASH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},${COLUMN_REVOKED},${COLUMN_REVOKED_AT_UTC} AS ${ALIAS_COLUMN_REVOKED_AT_UTC}
                        FROM ${TABLE_NAME}
                        WHERE ${COLUMN_TOKEN_HASH}=$1`,
        [hashedRefreshToken])).rows[0]
}

export async function create(refreshToken: CreateRefreshToken):Promise<RefreshToken> {
    return (await pool.query(
        `INSERT INTO ${TABLE_NAME}(${COLUMN_USER_ID},${COLUMN_TOKEN_HASH})
                    VALUES ($1,$2)
                    RETURNING ${COLUMN_USER_ID} AS ${ALIAS_COLUMN_USER_ID},${COLUMN_TOKEN_HASH} AS ${ALIAS_COLUMN_TOKEN_HASH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},${COLUMN_REVOKED},${COLUMN_REVOKED_AT_UTC} AS ${ALIAS_COLUMN_REVOKED_AT_UTC}`,
        [refreshToken.userId, refreshToken.tokenHash])).rows[0];
}
export async function revoke(tokenHash:string):Promise<void> {
    (await pool.query(
        `UPDATE ${TABLE_NAME}
                        SET ${COLUMN_REVOKED} = TRUE,
                            ${COLUMN_REVOKED_AT_UTC} = now()
                        WHERE ${COLUMN_TOKEN_HASH} = $1`
                    ,[tokenHash]));
}

export async function remove(tokenHash:string):Promise<void> {
    (await pool.query(
        `DELETE
         FROM ${TABLE_NAME}
         WHERE ${COLUMN_TOKEN_HASH} = $1`
        , [tokenHash]));
}