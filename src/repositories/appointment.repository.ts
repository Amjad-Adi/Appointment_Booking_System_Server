import {AppointmentResponse,Appointment,CreateAppointment,UpdateAppointmentByUser,UpdateAppointmentByOrganization,QueryAppointment} from "../models/appointment.model.js"
import {pool} from "../databases/postgre-connection.js"
import {
    AppointmentResponse,
    Appointment,
    UpdateAppointmentByOrganization,
    ConfirmAppointment,
    CreateAppointment,
    RejectAppointment,
    QueryAppointment,
    PayAppointment,
    UpdateAppointmentByUser,
    UpdateAppointmentStatus
} from "../models/appointment.model.js";

import { pool } from "../databases/postgre-connection.js";

import {
    COLUMN_UUID,
    COLUMN_NAME,
    COLUMN_CREATED_AT_UTC,
    TABLE_NAME,
    ALIAS, COLUMN_PAYMENT_METHOD, ALIAS_COLUMN_CREATED_AT_UTC, SORT_BY_NAME,
} from "../databases/contracts/appointment.contract";

import {
    ALIAS as ORGANIZATION_ALIAS,
    COLUMN_UUID as ORGANIZATION_COLUMN_UUID,
    COLUMN_NAME as ORGANIZATION_COLUMN_NAME,
    ALIAS_COLUMN_
    COLUMN_EMAIL as ORGANIZATION_COLUMN_EMAIL,
    COLUMN_PHONE_NUMBER as ORGANIZATION_COLUMN_PHONE_NUMBER,
    ALIAS_COLUMN_ORGANIZATION_UUID,
    ALIAS_COLUMN_NAME as ORGANIZATION_ALIAS_COLUMN_NAME,
} from "../databases/contracts/organization.contract";

import {
    ALIAS as ROOM_ALIAS,
    COLUMN_UUID as ROOM_COLUMN_UUID,
    COLUMN_NAME as ROOM_COLUMN_NAME,
} from "../databases/contracts/room.contract";

import {
    ALIAS as SERVICE_ALIAS,
    COLUMN_UUID as SERVICE_COLUMN_UUID,
    COLUMN_NAME as SERVICE_COLUMN_NAME,
    COLUMN_PRICE as SERVICE_COLUMN_PRICE, ALIAS_TOTAL_NUMBER_OF_SERVICES, COLUMN_PRICE,
} from "../databases/contracts/service.contract";

import {
    ALIAS as USER_ALIAS,
    SECONDARY_ALIAS as APPROVAL_USER_ALIAS,
    COLUMN_UUID as USER_COLUMN_UUID,
    COLUMN_FIRST_NAME as USER_COLUMN_FIRST_NAME,
    COLUMN_LAST_NAME as USER_COLUMN_LAST_NAME,
    COLUMN_EMAIL as USER_COLUMN_EMAIL,
    COLUMN_PROFILE_PICTURE_PATH as USER_COLUMN_PROFILE_PICTURE_PATH,
    COLUMN_PHONE_NUMBER as USER_COLUMN_PHONE_NUMBER,
} from "../databases/contracts/user.contract";

import {
    ALIAS_COLUMN_ACTUAL_END_AT_UTC,
    ALIAS_COLUMN_ACTUAL_START_AT_UTC,
    ALIAS_COLUMN_APPOINTMENT_STATUS,
    ALIAS_COLUMN_ORGANIZATION_COLOUR,
    ALIAS_COLUMN_ORGANIZATION_NOTE,
    ALIAS_COLUMN_PAID_AT_UTC,
    ALIAS_COLUMN_PAYMENT_METHOD,
    ALIAS_COLUMN_REJECTION_REASON,
    ALIAS_COLUMN_SCHEDULED_END_AT_UTC,
    ALIAS_COLUMN_SCHEDULED_START_AT_UTC,
    ALIAS_COLUMN_USER_COLOUR,
    ALIAS_COLUMN_USER_NOTE,
    COLUMN_ACTUAL_END_AT_UTC,
    COLUMN_ACTUAL_START_AT_UTC,
    COLUMN_APPOINTMENT_STATUS,
    COLUMN_ORGANIZATION_COLOUR,
    COLUMN_ORGANIZATION_NOTE,
    COLUMN_PAID_AT_UTC,
    COLUMN_REJECTION_REASON,
    COLUMN_SCHEDULED_END_AT_UTC,
    COLUMN_SCHEDULED_START_AT_UTC,
    COLUMN_USER_COLOUR,
    COLUMN_USER_NOTE,
} from "../databases/contracts/appointment.contract";
import {QueryService} from "../models/service.model";
import {drizzleConnection} from "../databases/drizzle-connection";
import {workingHoursTable} from "../drizzle-schemas/working-hours.db";
import {organizationTable} from "../drizzle-schemas/organizations.db";
import {eq} from "drizzle-orm";
import {appointmentTable} from "../drizzle-schemas/appointment.db";
export async function findAllByUser(query:QueryAppointment,organizationUuid:string):Promise<AppointmentResponse[]>{
    const search=query.search?`%${query.search}%`: null
    const sortColumnsDefinition={
        name:`${ALIAS}.${COLUMN_NAME}`,
        scheduledStartTime:`${ALIAS}.${COLUMN_SCHEDULED_START_AT_UTC}`,
        scheduledEndTime:`${ALIAS}.${COLUMN_SCHEDULED_END_AT_UTC}`,
        paidAtUTC:`${ALIAS}.${COLUMN_PAID_AT_UTC}`
    }
    const sortColumn=sortColumnsDefinition[query.sortBy?? SORT_BY_NAME];
    const sortOrder = query.order?.toUpperCase() as string;
    return (await drizzleConnection
        .select({uuid:appointmentTable.uuid,name:appointmentTable.name,userNote:appointmentTable.userNote,userColour:appointmentTable.userColour,createdAtUTC:appointmentTable.createdAtUTC,scheduledStartAtUTC:appointmentTable.scheduledStartAtUTC,scheduledEndAtUTC:appointmentTable.scheduledEndAtUTC,paymentMethod:appointmentTable.paymentMethod,paidAtUTC:appointmentTable.paidAtUTC,appointmentStatus:appointmentTable.appointmentStatus})
        .from(appointmentTable)
        .leftJoin(organizationTable,eq(workingHoursTable.organizationId,organizationTable.id))
        .where(eq(organizationTable.uuid,organizationUuid)))
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