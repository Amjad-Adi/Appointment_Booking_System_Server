import {ServiceResponse, Service, UpdateService, CreateService, QueryService} from "../models/service.model.js"
import {pool} from "../databases/postgre-connection.js"
import {
    COLUMN_UUID,
    COLUMN_NAME,
    COLUMN_ORGANIZATION_ID,
    COLUMN_DESCRIPTION,
    COLUMN_PRICE,
    COLUMN_DURATION_IN_MINUTES,
    COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC,
    COLUMN_STATUS,
    TABLE_NAME,
    ALIAS,
    COLUMN_PICTURE_PATH, ALIAS_COLUMN_DURATION_IN_MINUTES, ALIAS_COLUMN_PICTURE_PATH, ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_UPDATED_AT_UTC, ALIAS_TOTAL_NUMBER_OF_SERVICES, SORT_BY_NAME
} from "../databases/contracts/service.contract.js"
import {
    TABLE_NAME as ORGANIZATION_TABLE_NAME,
    ALIAS as ORGANIZATION_ALIAS,
    COLUMN_ID as ORGANIZATION_COLUMN_ID,
    COLUMN_NAME as ORGANIZATION_COLUMN_NAME,
    ALIAS_COLUMN_ORGANIZATION_UUID as ORGANIZATION_ALIAS_COLUMN_UUID,
    ALIAS_COLUMN_NAME as ORGANIZATION_ALIAS_COLUMN_NAME,
    ALIAS_COLUMN_PROFILE_PICTURE_PATH as ORGANIZATION_ALIAS_COLUMN_PROFILE_PICTURE_PATH,
    COLUMN_UUID as ORGANIZATION_COLUMN_UUID, COLUMN_PROFILE_PICTURE_PATH, ALIAS_COLUMN_ORGANIZATION_UUID,
} from "../databases/contracts/organization.contract.js"
import {QueryUser} from "../models/user.model.js";

export async function findAll(query:QueryService,organizationUuid:string):Promise<ServiceResponse[]>{
    const search=query.search?`%${query.search}%`: null
    const sortColumnsDefinition={
        name:`${ALIAS}.${COLUMN_NAME}`,
        createdAtUTC:`${ALIAS}.${COLUMN_CREATED_AT_UTC}`,
        price:`${ALIAS}.${COLUMN_PRICE}`,
        durationInMinutes:`${ALIAS}.${COLUMN_DURATION_IN_MINUTES}`
    }
    const sortColumn=sortColumnsDefinition[query.sortBy?? SORT_BY_NAME];
    const sortOrder = query.order?.toUpperCase() as string;
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_NAME},${ALIAS}.${COLUMN_DESCRIPTION},${ALIAS}.${COLUMN_PRICE},${ALIAS}.${COLUMN_DURATION_IN_MINUTES},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME} as ${ORGANIZATION_ALIAS_COLUMN_NAME}, ${ORGANIZATION_ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ORGANIZATION_ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ALIAS}.${COLUMN_PICTURE_PATH} AS ${ALIAS_COLUMN_PICTURE_PATH} ,${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS} ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}=${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE
         ${ORGANIZATION_ALIAS}.${ALIAS_COLUMN_ORGANIZATION_UUID}=$1
         AND ($2::TEXT IS NULL OR ${ALIAS}.${COLUMN_NAME} ILIKE $1)
         AND ($3::TEXT IS NULL OR ${ALIAS}.${COLUMN_PRICE}<=$2)
         AND ($4::TEXT IS NULL OR ${ALIAS}.${COLUMN_PRICE}>=$3)
         AND ($5::TEXT IS NULL OR ${ALIAS}.${COLUMN_STATUS}=$4)
         ORDER BY ${sortColumn} ${sortOrder},${ALIAS}.${COLUMN_UUID}
         LIMIT $6
         OFFSET $7`,
       [organizationUuid,search, query.filter?.maxPrice,query.filter?.minPrice,query.filter?.status?.toUpperCase(),query.limit,query.offset])).rows
}

export async function countAll(query:QueryService,organizationUuid:string):Promise<number>{
    const search=query.search?`%${query.search}%`: null
    return Number((await pool.query(
        `SELECT COUNT(*) AS ${ALIAS_TOTAL_NUMBER_OF_SERVICES}
         FROM ${TABLE_NAME} ${ALIAS}
         WHERE 
         ${ORGANIZATION_ALIAS}.${ALIAS_COLUMN_ORGANIZATION_UUID}=$1
         AND
         ($2::TEXT IS NULL OR  ${ALIAS}.${COLUMN_NAME} ILIKE $1)
         AND ($3::TEXT IS NULL OR ${ALIAS}.${COLUMN_PRICE}<=$2)
         AND ($4::TEXT IS NULL OR ${ALIAS}.${COLUMN_PRICE}>=$3)
         AND ($5::TEXT IS NULL OR ${ALIAS}.${COLUMN_STATUS}=$4)`,
        [organizationUuid,search, query.filter?.maxPrice,query.filter?.minPrice,query.filter?.status?.toUpperCase()])).rows[0].totalNumberOfServices)
}

export async function findByUuid(serviceUuid:string):Promise<ServiceResponse>{
    return (await pool.query(
        `SELECT ${ALIAS}.${COLUMN_UUID},${ALIAS}.${COLUMN_NAME},${ALIAS}.${COLUMN_DESCRIPTION},${ALIAS}.${COLUMN_PRICE},${ALIAS}.${COLUMN_DURATION_IN_MINUTES},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID},${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME} as ${ORGANIZATION_ALIAS_COLUMN_NAME}, ${ORGANIZATION_ALIAS}.${COLUMN_PROFILE_PICTURE_PATH} AS ${ORGANIZATION_ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ALIAS}.${COLUMN_PICTURE_PATH} AS ${ALIAS_COLUMN_PICTURE_PATH} ,${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC}, ${ALIAS}.${COLUMN_STATUS}
         FROM ${TABLE_NAME} ${ALIAS}
         LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS} ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}=${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
         WHERE ${ORGANIZATION_ALIAS}.${ALIAS_COLUMN_ORGANIZATION_UUID}=$1 AND ${ALIAS}.${COLUMN_UUID} = $2`,
        [serviceUuid])).rows[0]
}

export async function isNameFound(organizationUuid:string,name:string):Promise<boolean>{
    return (await pool.query(
        `SELECT 1
         FROM ${TABLE_NAME} ${ALIAS}
        LEFT JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS} ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}=${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
        WHERE ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $1 AND ${ALIAS}.${COLUMN_NAME}=$2`,
        [organizationUuid,name])).rowCount!=0
}

export async function create(service: CreateService):Promise<Service> {
    return (await pool.query(
        `INSERT INTO ${TABLE_NAME}(${COLUMN_NAME},${COLUMN_DESCRIPTION},${COLUMN_PRICE},${COLUMN_DURATION_IN_MINUTES},${COLUMN_PICTURE_PATH},${COLUMN_ORGANIZATION_ID})
                    VALUES ($1,$2,$3,$4,$5,$6)
                    RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_DESCRIPTION},${COLUMN_PRICE},${COLUMN_DURATION_IN_MINUTES} AS ${ALIAS_COLUMN_DURATION_IN_MINUTES},${COLUMN_PICTURE_PATH} AS ${ALIAS_COLUMN_PICTURE_PATH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_STATUS}`,
                    [service.name, service.description,service.price,service.durationInMinutes,service.profilePicturePath,service.organizationId])).rows[0];
}

export async function update(service: UpdateService):Promise<Service> {
    return (await pool.query(
        `UPDATE ${TABLE_NAME}
         SET ${COLUMN_NAME}=COALESCE($1,${COLUMN_NAME}),
             ${COLUMN_DESCRIPTION}=COALESCE($2,${COLUMN_DESCRIPTION}),
             ${COLUMN_PRICE}=COALESCE($3,${COLUMN_PRICE}),
             ${COLUMN_DURATION_IN_MINUTES}=COALESCE($4,${COLUMN_DURATION_IN_MINUTES}),
             ${COLUMN_PICTURE_PATH}=COALESCE($5,${COLUMN_PICTURE_PATH}),
             ${COLUMN_STATUS}=COALESCE($6,${COLUMN_STATUS}),
             ${COLUMN_UPDATED_AT_UTC}=now()
         WHERE ${COLUMN_UUID} = $7 
         AND ${COLUMN_ORGANIZATION_ID}=
               (SELECT id
                FROM TABLE ${ORGANIZATION_TABLE_NAME}
                WHERE ${ORGANIZATION_COLUMN_UUID}=$8)
        RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_DESCRIPTION},${COLUMN_PRICE},${COLUMN_DURATION_IN_MINUTES} AS ${ALIAS_COLUMN_DURATION_IN_MINUTES},${COLUMN_PICTURE_PATH} AS ${ALIAS_COLUMN_PICTURE_PATH},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_STATUS}`,
        [service.name, service.description, service.price,service.durationInMinutes,service.profilePicturePath,service.status,service.uuid,service.organizationUuid])).rows[0];
}