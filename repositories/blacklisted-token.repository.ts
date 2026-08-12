import {pool} from "../databases/postgre-connection"
import {
    COLUMN_EXPIRES_AT_UTC,
    COLUMN_REASON, COLUMN_BLACKLISTED_AT_UTC, COLUMN_ID, COLUMN_JTI, TABLE_NAME,
    ALIAS_COLUMN_EXPIRES_AT_UTC, ALIAS_COLUMN_BLACKLISTED_AT_UTC,
} from "../databases/contracts/blacklisted-token.contract"
import {CreateRefreshToken, RefreshToken} from "../models/refresh-token.model";
import {BlacklistedToken, CreateBlacklistedToken} from "../models/blacklisted-token.model";

export async function findBlacklistedToken(jti:string):Promise<BlacklistedToken>{
    try{
        return (await pool.query(
            `SELECT ${COLUMN_JTI} ,${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},${COLUMN_BLACKLISTED_AT_UTC} AS ${ALIAS_COLUMN_BLACKLISTED_AT_UTC},${COLUMN_REASON}
                            FROM ${TABLE_NAME}
                            WHERE ${COLUMN_JTI}=$1 AND ${COLUMN_EXPIRES_AT_UTC} > now()`,
            [jti])).rows[0]
    } catch (e) {
        console.error(e)
        throw e;
    }
}


export async function create(blacklistedToken: CreateBlacklistedToken):Promise<BlacklistedToken> {
    try{
        return (await pool.query(
            `INSERT INTO ${TABLE_NAME}(${COLUMN_JTI},${COLUMN_EXPIRES_AT_UTC},${COLUMN_REASON})
                        VALUES ($1,$2,$3)
                        RETURNING ${COLUMN_JTI} ,${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},${COLUMN_BLACKLISTED_AT_UTC} AS ${ALIAS_COLUMN_BLACKLISTED_AT_UTC},${COLUMN_REASON}`,
            [blacklistedToken.jti, blacklistedToken.expiresAtUTC,blacklistedToken.reason])).rows[0];
    } catch (e) {
        console.error(e)
        throw e;
    }
}