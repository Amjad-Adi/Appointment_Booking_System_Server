import {
    RoomResponse,
    Room,
    UpdateRoom,
    CreateRoom,
    QueryRoom,
} from "../models/room.model";

import { pool } from "../databases/postgres-connection";

import {
    COLUMN_UUID,
    COLUMN_NAME,
    COLUMN_ORGANIZATION_ID,
    COLUMN_DESCRIPTION,
    COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC,
    COLUMN_STATUS,
    COLUMN_OCCUPANCY_STATUS,
    TABLE_NAME,
    ALIAS,
    ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_UPDATED_AT_UTC,
    ALIAS_COLUMN_OCCUPANCY_STATUS,
    ALIAS_TOTAL_NUMBER_OF_ROOMS,
    COLUMN_USER_ID, SORT_BY_CREATED_AT_UTC, SORT_BY_UPDATED_AT_UTC,
} from "../databases/contracts/room.contract";

import {
    TABLE_NAME as ORGANIZATION_TABLE_NAME,
    ALIAS as ORGANIZATION_ALIAS,
    COLUMN_ID as ORGANIZATION_COLUMN_ID,
    COLUMN_NAME as ORGANIZATION_COLUMN_NAME,
    COLUMN_UUID as ORGANIZATION_COLUMN_UUID,
    ALIAS_COLUMN_ORGANIZATION_UUID as ORGANIZATION_ALIAS_COLUMN_UUID,
    ALIAS_COLUMN_NAME as ORGANIZATION_ALIAS_COLUMN_NAME, COLUMN_ID,
} from "../databases/contracts/organization.contract";

import {
    TABLE_NAME as USER_TABLE_NAME,
    ALIAS as USER_ALIAS,
    COLUMN_ID as USER_COLUMN_ID,
    COLUMN_UUID as USER_COLUMN_UUID,
    COLUMN_FIRST_NAME as USER_COLUMN_FIRST_NAME,
    COLUMN_LAST_NAME as USER_COLUMN_LAST_NAME,
    COLUMN_PROFILE_PICTURE_PATH as USER_COLUMN_PROFILE_PICTURE_PATH,
    COLUMN_ORGANIZATION_ID as USER_COLUMN_ORGANIZATION_ID,
    ALIAS_COLUMN_USER_UUID as USER_ALIAS_COLUMN_USER_UUID,
    ALIAS_COLUMN_FIRST_NAME as USER_ALIAS_COLUMN_FIRST_NAME,
    ALIAS_COLUMN_LAST_NAME as USER_ALIAS_COLUMN_LAST_NAME,
    ALIAS_COLUMN_PROFILE_PICTURE_PATH as USER_ALIAS_COLUMN_PROFILE_PICTURE_PATH, SORT_BY_NAME,
} from "../databases/contracts/user.contract";
import { Order } from '../models/enums/order';
import { mapDatabaseError } from '../utils/map/map-database-error';

export async function findAll(query: QueryRoom): Promise<RoomResponse[]> {
    const search = query.search ? `%${query.search}%` : null;
    const sortColumnsDefinition = {
        [SORT_BY_NAME]: `${ALIAS}.${COLUMN_NAME}`,
        [SORT_BY_CREATED_AT_UTC]: `${ALIAS}.${COLUMN_CREATED_AT_UTC}`,
        [SORT_BY_UPDATED_AT_UTC]:`${ALIAS}.${COLUMN_UPDATED_AT_UTC}`,
    };
    const sortColumn=sortColumnsDefinition[query.sortBy?? SORT_BY_NAME];
    const sortOrder =query?.order?.toUpperCase() ?? Order.ASC;
    const {occupancyStatus, status, organizationUuid,} = query.filter ?? {};
    return (await pool.query(
            `SELECT ${ALIAS}.${COLUMN_UUID},  ${ALIAS}.${COLUMN_NAME},  ${ALIAS}.${COLUMN_DESCRIPTION},  ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID}, ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME} AS ${ORGANIZATION_ALIAS_COLUMN_NAME},${USER_ALIAS}.${USER_COLUMN_UUID} AS ${USER_ALIAS_COLUMN_USER_UUID},${USER_ALIAS}.${USER_COLUMN_FIRST_NAME} AS ${USER_ALIAS_COLUMN_FIRST_NAME},${USER_ALIAS}.${USER_COLUMN_LAST_NAME} AS ${USER_ALIAS_COLUMN_LAST_NAME},${USER_ALIAS}.${USER_COLUMN_PROFILE_PICTURE_PATH} AS ${USER_ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_STATUS},${ALIAS}.${COLUMN_OCCUPANCY_STATUS}  AS ${ALIAS_COLUMN_OCCUPANCY_STATUS}
             FROM ${TABLE_NAME} ${ALIAS}
             INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
              ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
              LEFT JOIN ${USER_TABLE_NAME} ${USER_ALIAS} ON ${ALIAS}.${COLUMN_USER_ID}= ${USER_ALIAS}.${USER_COLUMN_ID}
             WHERE ($1::UUID IS NULL OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $1)
             AND ($2::TEXT IS NULL OR ${ALIAS}.${COLUMN_NAME} ILIKE $2)
             AND ($3::TEXT IS NULL OR ${ALIAS}.${COLUMN_STATUS} ILIKE $3)
             AND ($4::TEXT IS NULL OR ${ALIAS}.${COLUMN_OCCUPANCY_STATUS} ILIKE $4)
             ORDER BY ${sortColumn} ${sortOrder},${ALIAS}.${COLUMN_UUID}
             LIMIT $5
             OFFSET $6`,
            [organizationUuid,search,status,occupancyStatus, query.limit, query.offset])).rows;
}

export async function countAll(query: QueryRoom): Promise<number> {
    const search = query.search ? `%${query.search}%` : null;
    return Number((await pool.query(
                `SELECT COUNT(*) AS ${ALIAS_TOTAL_NUMBER_OF_ROOMS}
                 FROM ${TABLE_NAME} ${ALIAS}
                 INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
                 ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
                 WHERE ($1::UUID IS NULL OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $1)
                 AND ($2::TEXT IS NULL OR ${ALIAS}.${COLUMN_NAME} ILIKE $2)
                 AND ($3::TEXT IS NULL OR ${ALIAS}.${COLUMN_STATUS} ILIKE $3)
                 AND ($4::TEXT IS NULL OR ${ALIAS}.${COLUMN_OCCUPANCY_STATUS} ILIKE $4)`,
                [query.filter?.organizationUuid, search, query.filter?.status, query.filter?.occupancyStatus])).rows[0].totalNumberOfRooms,
    );
}

export async function findByUuid(roomUuid: string,organizationUuid:string):Promise<RoomResponse> {
    return (
        await pool.query(
            `SELECT ${ALIAS}.${COLUMN_UUID},  ${ALIAS}.${COLUMN_NAME},  ${ALIAS}.${COLUMN_DESCRIPTION},  ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ORGANIZATION_ALIAS_COLUMN_UUID}, ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME} AS ${ORGANIZATION_ALIAS_COLUMN_NAME}, ${USER_ALIAS}.${USER_COLUMN_UUID} AS ${USER_ALIAS_COLUMN_USER_UUID},${USER_ALIAS}.${USER_COLUMN_FIRST_NAME} AS ${USER_ALIAS_COLUMN_FIRST_NAME},${USER_ALIAS}.${USER_COLUMN_LAST_NAME} AS ${USER_ALIAS_COLUMN_LAST_NAME},${USER_ALIAS}.${USER_COLUMN_PROFILE_PICTURE_PATH} AS ${USER_ALIAS_COLUMN_PROFILE_PICTURE_PATH},${ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${ALIAS}.${COLUMN_STATUS},${ALIAS}.${COLUMN_OCCUPANCY_STATUS}  AS ${ALIAS_COLUMN_OCCUPANCY_STATUS}
             FROM ${TABLE_NAME} ${ALIAS}
             INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
             ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}= ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
             LEFT JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
             ON ${ALIAS}.${COLUMN_USER_ID}= ${USER_ALIAS}.${USER_COLUMN_ID}
             WHERE ${ALIAS}.${COLUMN_UUID} = $1
             AND ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $2`,
            [roomUuid,organizationUuid])).rows[0];
}

export async function create(room: CreateRoom): Promise<Room> {
    try{
        return (await pool.query(
            `INSERT INTO ${TABLE_NAME}(${COLUMN_NAME}, ${COLUMN_DESCRIPTION}, ${COLUMN_ORGANIZATION_ID}, ${COLUMN_USER_ID})
                 SELECT $1,$2,${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID},${USER_ALIAS}.${USER_COLUMN_ID}
                 FROM ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
                 INNER JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
                 ON ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}=${USER_ALIAS}.${USER_COLUMN_ORGANIZATION_ID}
                 WHERE ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID}=$3
                 AND ${USER_ALIAS}.${USER_COLUMN_UUID}=$4
                 RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_DESCRIPTION},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_STATUS}, ${COLUMN_OCCUPANCY_STATUS} AS ${ALIAS_COLUMN_OCCUPANCY_STATUS}`,
            [room.name, room.description, room.organizationUuid, room.assignedUserUuid])).rows[0];
    }catch (error) {
        mapDatabaseError(error);
    }
}

export async function update(room: UpdateRoom): Promise<Room> {
    try{
        return (
            await pool.query(
                `UPDATE ${TABLE_NAME}
                 SET
                     ${COLUMN_NAME}=COALESCE($1,${COLUMN_NAME}),
                     ${COLUMN_DESCRIPTION}=COALESCE($2,${COLUMN_DESCRIPTION}),
                     ${COLUMN_STATUS}=COALESCE($3,${COLUMN_STATUS}),
                     ${COLUMN_OCCUPANCY_STATUS}=COALESCE($4,${COLUMN_OCCUPANCY_STATUS}),
                     ${COLUMN_USER_ID}=(
                         SELECT ${USER_COLUMN_ID}
                         FROM ${USER_TABLE_NAME}
                         WHERE ${USER_COLUMN_UUID} = $5),
                     ${COLUMN_UPDATED_AT_UTC}=now()
                 WHERE ${COLUMN_UUID} = $6
                 AND ${COLUMN_ORGANIZATION_ID} = (
                     SELECT ${ORGANIZATION_COLUMN_ID}
                     FROM ${ORGANIZATION_TABLE_NAME}
                     WHERE ${ORGANIZATION_COLUMN_UUID} = $7)
                     RETURNING ${COLUMN_UUID},${COLUMN_NAME},${COLUMN_DESCRIPTION},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_STATUS}, ${COLUMN_OCCUPANCY_STATUS} AS ${ALIAS_COLUMN_OCCUPANCY_STATUS}`,
                [room.name, room.description, room.status, room.occupancyStatus, room.assignedUserUuid, room.uuid,room.organizationUuid])).rows[0];
    }catch (error) {
        mapDatabaseError(error);
    }
}

export async function findIdByUuid(roomUuid: string, organizationUuid: string): Promise<number> {
    return (
        await pool.query(
            `SELECT ${ALIAS}.${COLUMN_ID}
             FROM ${TABLE_NAME} ${ALIAS}
             INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
                ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} =
                   ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
             WHERE
                ${ALIAS}.${COLUMN_UUID} = $1
                AND ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $2`,
            [roomUuid, organizationUuid],
        )
    ).rows[0]?.id;
}

export async function findIdByUserUuid(userUuid: string, organizationUuid: string): Promise<number> {
    return (
        await pool.query(
            `SELECT ${ALIAS}.${COLUMN_ID}
             FROM ${TABLE_NAME} ${ALIAS}
             INNER JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
                ON ${ALIAS}.${COLUMN_USER_ID} =
                   ${USER_ALIAS}.${USER_COLUMN_ID}
             INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
                ON ${ALIAS}.${COLUMN_ORGANIZATION_ID} =
                   ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
             WHERE
                ${USER_ALIAS}.${COLUMN_UUID} = $1
                AND ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $2`,
            [userUuid, organizationUuid])).rows[0]?.id;
}