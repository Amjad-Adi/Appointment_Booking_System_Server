import {
    CreateUser,
    QueryUser,
    UpdateUser,
    UpdateUserByAdmin,
    User,
    UserResponse,
} from "../models/user.model"
import {pool} from "../databases/postgre-connection"
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
    ALIAS_COLUMN_ORGANIZATION_ID,
    ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_UPDATED_AT_UTC,
    ALIAS_COLUMN_PROFILE_PICTURE_PATH,//Without alias names not compatible with JSON
    COLUMN_ORGANIZATION_ID, COLUMN_ID, ALIAS, ALIAS_TOTAL_NUMBER_OF_USERS, SORT_BY_NAME
}
    from "../databases/contracts/user.contract"
import {PoolClient, QueryResult} from "pg";
import {
    TABLE_NAME as ORGANIZATION_TABLE_NAME,
    ALIAS as ORGANIZATION_ALIAS,
    COLUMN_ID as ORGANIZATION_COLUMN_ID,
    COLUMN_UUID as ORGANIZATION_COLUMN_UID,
    COLUMN_NAME as ORGANIZATION_COLUMN_NAME,
    ALIAS_COLUMN_PROFILE_PICTURE_PATH as ORGANIZATION_ALIAS_COLUMN_PROFILE_PICTURE_PATH,
    COLUMN_UUID as ORGANIZATION_COLUMN_UUID,
    ALIAS_COLUMN_ORGANIZATION_UUID as ORGANIZATION_ALIAS_COLUMN_UUID
} from "../databases/contracts/organization.contract"
import {Query} from "../models/query.model";
export async function findAll(query:QueryUser):Promise<UserResponse[]>{
    const search=query.search?`%${query.search}%`: null
    const sortColumnsDefinition={
        name:`${ALIAS}.${COLUMN_FIRST_NAME}||' '||${ALIAS}.${COLUMN_LAST_NAME}`,
        createdAtUTC:`${ALIAS}.${COLUMN_CREATED_AT_UTC}`,
    }
    const sortColumn=sortColumnsDefinition[query.sortBy?? SORT_BY_NAME];
    const sortOrder =query.order?.toUpperCase() as string;
    const {role,status}=query.filter??{}
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${ALIAS}.${COLUMN_LAST_NAME} AS ${COLUMN_LAST_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_LANGUAGE},${ALIAS}.${COLUMN_ROLE}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE 
         ($1::TEXT IS NULL OR ${ALIAS}.${COLUMN_FIRST_NAME}||' '||${ALIAS}.${COLUMN_LAST_NAME} ILIKE $1 OR ${ALIAS}.${COLUMN_EMAIL} ILIKE $1)
         AND ($2::TEXT IS NULL OR ${ALIAS}.${COLUMN_ROLE}=$2)
         AND ($3::TEXT IS NULL OR ${ALIAS}.${COLUMN_STATUS}=$3)
         ORDER BY ${sortColumn} ${sortOrder},${ALIAS}.${COLUMN_UUID}
         LIMIT $4
         OFFSET $5`,
       [search, role,status,query.limit,query.offset])).rows
}


export async function countAll(query:QueryUser):Promise<number>{
    const search=query.search?`%${query.search}%`: null
    const {role,status}=query.filter??{}
    return Number((await pool.query(
        `SELECT COUNT(*) AS ${ALIAS_TOTAL_NUMBER_OF_USERS}
         FROM ${TABLE_NAME} ${ALIAS}
         WHERE
         ($1::TEXT IS NULL OR ${ALIAS}.${COLUMN_FIRST_NAME}||' '||${ALIAS}.${COLUMN_LAST_NAME} ILIKE $1 OR ${ALIAS}.${COLUMN_EMAIL} ILIKE $1)
         AND ($2::TEXT IS NULL OR ${ALIAS}.${COLUMN_ROLE}=$2)
         AND ($3::TEXT IS NULL OR ${ALIAS}.${COLUMN_STATUS}=$3)`,
        [search,  role,status])).rows[0].totalNumberOfUsers)
}


export async function findByUid(uid:string):Promise<UserResponse>{
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${ALIAS}.${COLUMN_LAST_NAME} AS ${COLUMN_LAST_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_LANGUAGE},${ALIAS}.${COLUMN_ROLE}, ${ALIAS}.${COLUMN_STATUS}
        FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE ${ALIAS}.${COLUMN_UID} = $1`,
         [uid])).rows[0]
}

export async function findByUuid(uuid:string):Promise<UserResponse>{
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${ALIAS}.${COLUMN_LAST_NAME} AS ${COLUMN_LAST_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_LANGUAGE},${ALIAS}.${COLUMN_ROLE}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE ${ALIAS}.${COLUMN_UUID} = $1`,
        [uuid])).rows[0]
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
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${ALIAS}.${COLUMN_LAST_NAME} AS ${COLUMN_LAST_NAME},${ALIAS}.${COLUMN_EMAIL},${ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_LANGUAGE},${ALIAS}.${COLUMN_ROLE}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
         ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE ${ALIAS}.${COLUMN_ID} = $1`,
        [id])).rows[0]
}

export async function isEmailFound(email:string):Promise<boolean>{
    return (await pool.query(
        `SELECT 1
         FROM ${TABLE_NAME}
         WHERE ${COLUMN_EMAIL} = $1`,
         [email])).rowCount!=0
}


export async function create(user: CreateUser):Promise<User> {
    return (await pool.query(
        `INSERT INTO ${TABLE_NAME}(${COLUMN_FIRST_NAME},${COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_UID},${COLUMN_PROFILE_PICTURE_PATH},${COLUMN_LANGUAGE},${COLUMN_ROLE})
                    VALUES ($1,$2,$3,$4,$5,$6,$7)
                    RETURNING ${COLUMN_UUID},${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${COLUMN_LAST_NAME} AS ${COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_LANGUAGE},${COLUMN_ROLE},${COLUMN_STATUS}`,
                    [user.firstName, user.lastName,user.email,user.uid,user.profilePicturePath,user.language,user.role])).rows[0];
}

export async function update(user: UpdateUser):Promise<User> {
    return (await pool.query(
        `UPDATE ${TABLE_NAME}
         SET ${COLUMN_FIRST_NAME}=COALESCE($1,${COLUMN_FIRST_NAME}),
             ${COLUMN_LAST_NAME}=COALESCE($2,${COLUMN_LAST_NAME}),
             ${COLUMN_PROFILE_PICTURE_PATH}=COALESCE($3,${COLUMN_PROFILE_PICTURE_PATH}),
             ${COLUMN_LANGUAGE}=COALESCE($4,${COLUMN_LANGUAGE}),
             ${COLUMN_UPDATED_AT_UTC}=now()
         WHERE ${COLUMN_UUID} = $5
         RETURNING ${COLUMN_UUID},${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${COLUMN_LAST_NAME} AS ${COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_LANGUAGE},${COLUMN_ROLE},${COLUMN_STATUS}`,
         [user.firstName, user.lastName, user.profilePicturePath,user.language,user.uuid])).rows[0];
}

export async function setUserOrganizationId(organizationId: number, userUuid:string, client?:PoolClient):Promise<void> {
    const dbPool=(client)?? pool;
    (await dbPool.query(
        `UPDATE ${TABLE_NAME}
         SET ${COLUMN_ORGANIZATION_ID}=$1
         WHERE ${COLUMN_UUID} = $2`,
        [organizationId, userUuid]));
}

export async function updateByAdmin(user: UpdateUserByAdmin):Promise<User> {
    return (await pool.query(
        `UPDATE ${TABLE_NAME}
         SET ${COLUMN_UPDATED_AT_UTC}=now(),
             ${COLUMN_ROLE}=COALESCE($1,${COLUMN_ROLE}),
             ${COLUMN_STATUS}=COALESCE($2,${COLUMN_STATUS})
         WHERE ${COLUMN_UUID} = $3
        RETURNING ${COLUMN_UUID},${COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_FIRST_NAME},${COLUMN_LAST_NAME} AS ${COLUMN_LAST_NAME},${COLUMN_EMAIL},${COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_PROFILE_PICTURE_PATH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_LANGUAGE},${COLUMN_ROLE},${COLUMN_STATUS}`,
        [user.role,user.status, user.uuid])).rows[0];
}