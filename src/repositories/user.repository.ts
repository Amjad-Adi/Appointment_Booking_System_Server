import {
    QueryUser,
    UpdateCurrentUser,
    User,
    UserResponse, CreateUser, UpdateUserByAdmin, UpdateUser,
} from "../models/user.model"
import {pool} from "../databases/postgres-connection"
import {
    COLUMN_UUID,
    COLUMN_FIRST_NAME,
    COLUMN_LAST_NAME,
    COLUMN_EMAIL,
    COLUMN_LANGUAGE,
    COLUMN_PROFILE_PICTURE_PATH,
    COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC,
    COLUMN_ROLE,
    COLUMN_STATUS,
    TABLE_NAME,
    COLUMN_UID,
    ALIAS_COLUMN_FIRST_NAME,
    ALIAS_COLUMN_LAST_NAME,
    ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_UPDATED_AT_UTC,
    ALIAS_COLUMN_PROFILE_PICTURE_PATH,//Without alias names not compatible with JSON
    COLUMN_ORGANIZATION_ID, COLUMN_ID, ALIAS, ALIAS_TOTAL_NUMBER_OF_USERS, SORT_BY_NAME, SORT_BY_CREATED_AT_UTC,
    SORT_BY_UPDATED_AT_UTC, COLUMN_PROFILE_PICTURE_ID
}
    from "../databases/contracts/user.contract"
import {PoolClient} from "pg";
import {
    TABLE_NAME as ORGANIZATION_TABLE_NAME,
    ALIAS as ORGANIZATION_ALIAS,
    COLUMN_ID as ORGANIZATION_COLUMN_ID,
    COLUMN_UUID as ORGANIZATION_COLUMN_UUID,
    ALIAS_COLUMN_ORGANIZATION_UUID as ORGANIZATION_ALIAS_COLUMN_UUID
} from "../databases/contracts/organization.contract"
import {Order} from "../models/enums/order";
import { mapDatabaseError } from '../utils/map/map-database-error';
import { ALIAS_COLUMN_PICTURE_ID, COLUMN_PICTURE_ID } from '../databases/contracts/service.contract';

export async function findAll(query:QueryUser):Promise<UserResponse[]>{
    const search=query.search?`%${query.search}%`: null
    const sortColumnsDefinition={
        [SORT_BY_NAME]:`${ALIAS}.${COLUMN_FIRST_NAME}||' '||${ALIAS}.${COLUMN_LAST_NAME}`,
        [SORT_BY_CREATED_AT_UTC]:`${ALIAS}.${COLUMN_CREATED_AT_UTC}`,
        [SORT_BY_UPDATED_AT_UTC]:`${ALIAS}.${COLUMN_UPDATED_AT_UTC}`,
    }
    const sortColumn=sortColumnsDefinition[query.sortBy?? SORT_BY_NAME];
    const sortOrder =query?.order?.toUpperCase() ?? Order.ASC;
    const {role, status, organizationUuid,} = query.filter ?? {};
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${ALIAS}.${COLUMN_LAST_NAME} AS ${ALIAS_COLUMN_LAST_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_LANGUAGE},${ALIAS}.${COLUMN_ROLE}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}= ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE 
         ($1::TEXT IS NULL OR ${ALIAS}.${COLUMN_FIRST_NAME}||' '||${ALIAS}.${COLUMN_LAST_NAME} ILIKE $1 OR ${ALIAS}.${COLUMN_EMAIL} ILIKE $1)
         AND ($2::TEXT IS NULL OR ${ALIAS}.${COLUMN_ROLE}=$2)
         AND ($3::TEXT IS NULL OR ${ALIAS}.${COLUMN_STATUS}=$3)
         AND ($4::UUID IS NULL OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $4)
         ORDER BY ${sortColumn} ${sortOrder},${ALIAS}.${COLUMN_UUID}
         LIMIT $5
         OFFSET $6`,
       [search, role,status,organizationUuid,query.limit,query.offset])).rows
}


export async function countAll(query:QueryUser):Promise<number>{
    const search=query.search?`%${query.search}%`: null
    const {role, status, organizationUuid,} = query.filter ?? {};
    return Number((await pool.query(
        `SELECT COUNT(*) AS ${ALIAS_TOTAL_NUMBER_OF_USERS}
         FROM ${TABLE_NAME} ${ALIAS}
          LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
          ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}= ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE
             ($1::TEXT IS NULL OR ${ALIAS}.${COLUMN_FIRST_NAME}||' '||${ALIAS}.${COLUMN_LAST_NAME} ILIKE $1 OR ${ALIAS}.${COLUMN_EMAIL} ILIKE $1)
           AND ($2::TEXT IS NULL OR ${ALIAS}.${COLUMN_ROLE}=$2)
           AND ($3::TEXT IS NULL OR ${ALIAS}.${COLUMN_STATUS}=$3)
           AND ($4::UUID IS NULL OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $4)`,
        [search,  role,status,organizationUuid])).rows[0].totalNumberOfUsers)
}


export async function findByUid(uid:string):Promise<UserResponse>{
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${ALIAS}.${COLUMN_LAST_NAME} AS ${ALIAS_COLUMN_LAST_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_LANGUAGE},${ALIAS}.${COLUMN_ROLE}, ${ALIAS}.${COLUMN_STATUS}
        FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE ${ALIAS}.${COLUMN_UID} = $1`,
         [uid])).rows[0]
}

export async function findByUuid(uuid:string,organizationUuid:string):Promise<UserResponse>{
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${ALIAS}.${COLUMN_LAST_NAME} AS ${ALIAS_COLUMN_LAST_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_LANGUAGE},${ALIAS}.${COLUMN_ROLE}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE ${ALIAS}.${COLUMN_UUID} = $1 AND ($2::UUID IS NULL OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $2)`,
        [uuid,organizationUuid])).rows[0]
}


export async function findIdByUuid(uuid:string):Promise<number>{
    return (await pool.query(
        `SELECT ${COLUMN_ID}
         FROM ${TABLE_NAME}
         WHERE ${COLUMN_UUID} = $1`,
        [uuid])).rows[0]?.id
}


export async function findUidByUuid(uuid:string):Promise<string>{
    return (await pool.query(
        `SELECT ${COLUMN_UID}
         FROM ${TABLE_NAME}
         WHERE ${COLUMN_UUID} = $1`,
        [uuid])).rows[0]?.firebase_uid
}

export async function findById(id:number):Promise<UserResponse>{
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${ALIAS}.${COLUMN_LAST_NAME} AS ${ALIAS_COLUMN_LAST_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_LANGUAGE},${ALIAS}.${COLUMN_ROLE}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE ${ALIAS}.${COLUMN_ID} = $1`,
        [id])).rows[0]
}

export async function findByEmail(email: string): Promise<UserResponse> {
    return (
        await pool.query(
            `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${ALIAS}.${COLUMN_LAST_NAME} AS ${ALIAS_COLUMN_LAST_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_LANGUAGE},${ALIAS}.${COLUMN_ROLE}, ${ALIAS}.${COLUMN_STATUS}
             FROM ${TABLE_NAME} ${ALIAS}
             LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
             ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
             WHERE ${ALIAS}.${COLUMN_EMAIL} = $1`,
            [email]
        )
    ).rows[0];
}


export async function create(user: CreateUser, client?:PoolClient):Promise<User> {
    const dbPool=(client)?? pool;
    try{
        return (await dbPool.query(
`INSERT INTO ${TABLE_NAME}(${COLUMN_FIRST_NAME},${COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_UID},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_PROFILE_PICTURE_ID},${COLUMN_LANGUAGE},${COLUMN_ROLE})
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING ${COLUMN_UUID},${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${COLUMN_LAST_NAME} AS ${ALIAS_COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_LANGUAGE},${COLUMN_ROLE},${COLUMN_STATUS}`,
            [user.firstName, user.lastName,user.email,user.uid,user.profilePicturePath,user.profilePictureId,user.language,user.role])).rows[0];
    }catch (error) {
        mapDatabaseError(error)
    }
}

export async function update(user:UpdateUser):Promise<User> {

    try{
        return (await pool.query(
            `UPDATE ${TABLE_NAME}
             SET ${COLUMN_FIRST_NAME}=COALESCE($1,${COLUMN_FIRST_NAME}),
                 ${COLUMN_LAST_NAME}=COALESCE($2,${COLUMN_LAST_NAME}),
                 ${COLUMN_PROFILE_PICTURE_PATH}=COALESCE($3,${COLUMN_PROFILE_PICTURE_PATH}),
                 ${COLUMN_PICTURE_ID}=COALESCE($4,${COLUMN_PICTURE_ID}),
                 ${COLUMN_LANGUAGE}=COALESCE($5,${COLUMN_LANGUAGE}),
                 ${COLUMN_ROLE}=COALESCE($6,${COLUMN_ROLE}),
                 ${COLUMN_STATUS}=COALESCE($7,${COLUMN_STATUS}),
                 ${COLUMN_UPDATED_AT_UTC}=now()
             WHERE ${COLUMN_UUID} = $8
             RETURNING ${COLUMN_UUID},${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${COLUMN_LAST_NAME} AS ${ALIAS_COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_LANGUAGE},${COLUMN_ROLE},${COLUMN_STATUS}`,
             [user?.firstName, user?.lastName, user.profilePicturePath,user.profilePictureId,user.language,user.role,user.status,user.uuid])).rows[0];
    }catch(error){
        mapDatabaseError(error);
    }
}

export async function setUserOrganizationId(organizationId: number, userUuid:string, client?:PoolClient):Promise<void> {
    const dbPool=(client)?? pool;
    (await dbPool.query(
        `UPDATE ${TABLE_NAME}
         SET ${COLUMN_ORGANIZATION_ID}=$1
         WHERE ${COLUMN_UUID} = $2`,
        [organizationId, userUuid]));
}


export async function findPictureIdByUuid(serviceUuid: string): Promise<string|undefined> {
    return (
        await pool.query(
            `SELECT ${ALIAS}.${COLUMN_PICTURE_ID} AS ${ALIAS_COLUMN_PICTURE_ID}
                FROM ${TABLE_NAME} ${ALIAS}
                WHERE
                ${ALIAS}.${COLUMN_UUID} = $1`,
            [serviceUuid])).rows[0]?.[ALIAS_COLUMN_PICTURE_ID];
}