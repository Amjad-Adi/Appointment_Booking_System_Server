import {CreateUser, UpdateUser, UpdateUserByAdmin, UserResponse} from "../models/user"
import {pool} from "../databases/postgre-connection"
import {COLUMN_UUID,COLUMN_FIRST_NAME,COLUMN_LAST_NAME,COLUMN_EMAIL,COLUMN_LANGUAGE,COLUMN_PROFILE_PICTURE_PATH,COLUMN_CREATED_AT_UTC,COLUMN_UPDATED_AT_UTC,COLUMN_ROLE, COLUMN_STATUS,TABLE_NAME} from "../databases/contract/user.contract"
import {QueryResult} from "pg";

export async function findAll():Promise<QueryResult<UserResponse>>{
    try{
        return await pool.query(
            `SELECT ${COLUMN_UUID},${COLUMN_FIRST_NAME},${COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_LANGUAGE},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC},${COLUMN_LANGUAGE},${COLUMN_ROLE}, ${COLUMN_STATUS}
             FROM ${TABLE_NAME}`)
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}

export async function findById(uuid:string):Promise<QueryResult<UserResponse>>{
    try {
        return await pool.query(
            `SELECT ${COLUMN_UUID},${COLUMN_FIRST_NAME},${COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC},${COLUMN_LANGUAGE},${COLUMN_ROLE}, ${COLUMN_STATUS}
             FROM ${TABLE_NAME}
             WHERE ${COLUMN_UUID} = $1`,
             [uuid])
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}

export async function isEmailFound(email:string):Promise<boolean>{
    try {
        return (await pool.query(
            `SELECT 1
             FROM ${TABLE_NAME}
             WHERE ${COLUMN_EMAIL} = $1`,
             [email])).rowCount!=0
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}


export async function create(user: CreateUser):Promise<QueryResult<UserResponse>> {
    try{
        return await pool.query(
            `INSERT INTO ${TABLE_NAME}(${COLUMN_FIRST_NAME},${COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC},${COLUMN_ROLE})
                        VALUES ($1,$2,$3,$4,$5,$6)
                        RETURNING ${COLUMN_UUID},${COLUMN_FIRST_NAME},${COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC},${COLUMN_ROLE},${COLUMN_STATUS}`,
                        [user.firstName, user.lastName,user.email,user.profilePicturePath,user.createdAtUTC,user.role]);
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}

export async function update(user: UpdateUser, uuid:string):Promise<QueryResult<UserResponse>> {
    try{
        return await pool.query(
            `UPDATE ${TABLE_NAME}
             SET ${COLUMN_FIRST_NAME}=COALESCE($1,${COLUMN_FIRST_NAME}),
                 ${COLUMN_LAST_NAME}=COALESCE($2,${COLUMN_LAST_NAME}),
                 ${COLUMN_PROFILE_PICTURE_PATH}=COALESCE($3,${COLUMN_PROFILE_PICTURE_PATH}),
                 ${COLUMN_LANGUAGE}=COALESCE($4,${COLUMN_LANGUAGE}),
                 ${COLUMN_UPDATED_AT_UTC}=COALESCE($5,${COLUMN_UPDATED_AT_UTC})
             WHERE ${COLUMN_UUID} = $6
            RETURNING ${COLUMN_UUID},${COLUMN_FIRST_NAME},${COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC},${COLUMN_ROLE},${COLUMN_STATUS}`,
            [user.firstName, user.lastName, user.profilePicturePath,user.language,user.updatedAtUTC,uuid]);
    }catch (e) {
        console.error(e)
        throw new Error()
    }
}


export async function updateByAdmin(user: UpdateUserByAdmin, uuid:string):Promise<QueryResult<UserResponse>> {
    try{
        return await pool.query(
            `UPDATE ${TABLE_NAME}
             SET ${COLUMN_UPDATED_AT_UTC}=COALESCE($1,${COLUMN_UPDATED_AT_UTC}),
                 ${COLUMN_ROLE}=COALESCE($2,${COLUMN_ROLE}),
                 ${COLUMN_STATUS}=COALESCE($3,${COLUMN_STATUS}),
             WHERE ${COLUMN_UUID} = $4
            RETURNING ${COLUMN_UUID},${COLUMN_FIRST_NAME},${COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC},${COLUMN_ROLE},${COLUMN_STATUS}`,
            [user.updatedAtUTC, user.role,user.status, uuid]);
    }catch (e) {
        console.error(e)
        throw new Error()
    }
}