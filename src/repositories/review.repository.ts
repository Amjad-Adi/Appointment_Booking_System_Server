import type { CreateReview, QueryReview, Review, ReviewResponse, UpdateReview } from '../models/review.model';
import { pool } from '../databases/postgres-connection';

import {
    ALIAS as REVIEW_ALIAS,
    ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_UPDATED_AT_UTC,
    ALIAS_TOTAL_NUMBER_OF_REVIEWS,
    COLUMN_COMMENT,
    COLUMN_CREATED_AT_UTC,
    COLUMN_RATING,
    COLUMN_UPDATED_AT_UTC,
    COLUMN_UUID,
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_RATING,
    SORT_BY_UPDATED_AT_UTC,
    TABLE_NAME as REVIEW_TABLE_NAME,
} from '../databases/contracts/review.contract';

import {
    ALIAS as USER_ALIAS,
    COLUMN_EMAIL as USER_COLUMN_EMAIL,
    COLUMN_FIRST_NAME as USER_COLUMN_FIRST_NAME,
    COLUMN_ID as USER_COLUMN_ID,
    COLUMN_LAST_NAME as USER_COLUMN_LAST_NAME,
    COLUMN_PROFILE_PICTURE_PATH as USER_COLUMN_PROFILE_PICTURE_PATH,
    COLUMN_UUID as USER_COLUMN_UUID,
    TABLE_NAME as USER_TABLE_NAME,
} from '../databases/contracts/user.contract';

import {
    COLUMN_APPOINTMENT_STATUS,
    COLUMN_ID as APPOINTMENT_COLUMN_ID,
    COLUMN_ORGANIZATION_ID as APPOINTMENT_COLUMN_ORGANIZATION_ID,
    COLUMN_SCHEDULED_END_AT_UTC,
    COLUMN_SCHEDULED_START_AT_UTC,
    COLUMN_SERVICE_ID as APPOINTMENT_COLUMN_SERVICE_ID,
    COLUMN_USER_ID as APPOINTMENT_COLUMN_USER_ID,
    COLUMN_UUID as APPOINTMENT_COLUMN_UUID,
    TABLE_NAME as APPOINTMENT_TABLE_NAME,
} from '../databases/contracts/appointment.contract';

import {
    ALIAS as SERVICE_ALIAS,
    COLUMN_ID as SERVICE_COLUMN_ID,
    COLUMN_NAME as SERVICE_COLUMN_NAME,
    COLUMN_UUID as SERVICE_COLUMN_UUID,
    TABLE_NAME as SERVICE_TABLE_NAME,
} from '../databases/contracts/service.contract';

import {
    ALIAS as ORGANIZATION_ALIAS,
    COLUMN_ID as ORGANIZATION_COLUMN_ID,
    COLUMN_NAME as ORGANIZATION_COLUMN_NAME,
    COLUMN_UUID as ORGANIZATION_COLUMN_UUID,
    TABLE_NAME as ORGANIZATION_TABLE_NAME,
} from '../databases/contracts/organization.contract';

import { Order } from '../models/enums/order';
import { AppointmentStatus } from '../models/enums/appointment-status';
import { mapDatabaseError } from '../utils/map/map-database-error';

const APPOINTMENT_ALIAS = 'a';

const SELECT_COLUMNS = `${REVIEW_ALIAS}.${COLUMN_UUID},
    ${REVIEW_ALIAS}.${COLUMN_RATING},
    ${REVIEW_ALIAS}.${COLUMN_COMMENT},
    ${REVIEW_ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},
    ${REVIEW_ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},
    ${USER_ALIAS}.${USER_COLUMN_UUID} AS "customerUuid",
    ${USER_ALIAS}.${USER_COLUMN_FIRST_NAME} AS "customerFirstName",
    ${USER_ALIAS}.${USER_COLUMN_LAST_NAME} AS "customerLastName",
    ${USER_ALIAS}.${USER_COLUMN_PROFILE_PICTURE_PATH} AS "customerProfilePicturePath",
    ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_UUID} AS "appointmentUuid",
    ${APPOINTMENT_ALIAS}.${COLUMN_SCHEDULED_START_AT_UTC} AS "scheduledStartAtUTC",
    ${SERVICE_ALIAS}.${SERVICE_COLUMN_UUID} AS "serviceUuid",
    ${SERVICE_ALIAS}.${SERVICE_COLUMN_NAME} AS "serviceName",
    ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS "organizationUuid",
    ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME} AS "organizationName"`;

const FROM_CLAUSE = `FROM ${REVIEW_TABLE_NAME} ${REVIEW_ALIAS}
    INNER JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
        ON ${USER_ALIAS}.${USER_COLUMN_ID} = ${REVIEW_ALIAS}.customer_id
    INNER JOIN ${APPOINTMENT_TABLE_NAME} ${APPOINTMENT_ALIAS}
        ON ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_ID} = ${REVIEW_ALIAS}.appointment_id
    INNER JOIN ${SERVICE_TABLE_NAME} ${SERVICE_ALIAS}
        ON ${SERVICE_ALIAS}.${SERVICE_COLUMN_ID} = ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_SERVICE_ID}
    INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
        ON ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID} = ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_ORGANIZATION_ID}`;

const FILTER_CLAUSE = `WHERE ($1::UUID IS NULL OR ${USER_ALIAS}.${USER_COLUMN_UUID} = $1)
    AND ($2::UUID IS NULL OR ${SERVICE_ALIAS}.${SERVICE_COLUMN_UUID} = $2)
    AND ($3::UUID IS NULL OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $3)
    AND ($4::NUMERIC IS NULL OR ${REVIEW_ALIAS}.${COLUMN_RATING} = $4)
    AND ($5::TEXT IS NULL OR ${REVIEW_ALIAS}.${COLUMN_COMMENT} ILIKE $5 OR ${USER_ALIAS}.${USER_COLUMN_FIRST_NAME} || ' ' || ${USER_ALIAS}.${USER_COLUMN_LAST_NAME} ILIKE $5)
    AND ($6::UUID IS NULL OR ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_UUID} = $6)`;

export async function findAll(query: QueryReview): Promise<ReviewResponse[]> {
    const search = query.search ? `%${query.search}%` : null;
    const sortColumnsDefinition = {
        [SORT_BY_CREATED_AT_UTC]: `${REVIEW_ALIAS}.${COLUMN_CREATED_AT_UTC}`,
        [SORT_BY_UPDATED_AT_UTC]: `${REVIEW_ALIAS}.${COLUMN_UPDATED_AT_UTC}`,
        [SORT_BY_RATING]: `${REVIEW_ALIAS}.${COLUMN_RATING}`,
    };
    const sortColumn = sortColumnsDefinition[query.sortBy ?? SORT_BY_CREATED_AT_UTC];
    const sortOrder = query.order?.toUpperCase() ?? Order.DESC;
    const rating = query.filter?.rating ?? null;

    return (await pool.query(
        `SELECT ${SELECT_COLUMNS}
         ${FROM_CLAUSE}
         ${FILTER_CLAUSE}
         ORDER BY ${sortColumn} ${sortOrder},${REVIEW_ALIAS}.${COLUMN_UUID}
         LIMIT $7
         OFFSET $8`,
        [
            query.userUuid ?? null,
            query.serviceUuid ?? query.filter?.serviceUuid ?? null,
            query.organizationUuid ?? query.filter?.organizationUuid ?? null,
            rating,
            search,
            query.filter?.appointmentUuid ?? null,
            query.limit,
            query.offset,
        ],
    )).rows;
}

export async function countAll(query: QueryReview): Promise<number> {
    const search = query.search ? `%${query.search}%` : null;
    const rating = query.filter?.rating ?? null;

    return Number((await pool.query(
        `SELECT COUNT(*) AS ${ALIAS_TOTAL_NUMBER_OF_REVIEWS}
         ${FROM_CLAUSE}
         ${FILTER_CLAUSE}`,
        [
            query.userUuid ?? null,
            query.serviceUuid ?? query.filter?.serviceUuid ?? null,
            query.organizationUuid ?? query.filter?.organizationUuid ?? null,
            rating,
            search,
            query.filter?.appointmentUuid ?? null,
        ],
    )).rows[0].totalNumberOfReviews);
}

export async function findReviewableAppointment(
    userUuid: string,
    appointmentUuid: string,
): Promise<{
    id: number;
    appointmentStatus: AppointmentStatus;
    scheduledEndAtUTC: Date | string;
    reviewUuid: string | null;
} | undefined> {
    return (await pool.query(
        `SELECT ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_ID} AS "id",
                ${APPOINTMENT_ALIAS}.${COLUMN_APPOINTMENT_STATUS} AS "appointmentStatus",
                ${APPOINTMENT_ALIAS}.${COLUMN_SCHEDULED_END_AT_UTC} AS "scheduledEndAtUTC",
                ${REVIEW_ALIAS}.${COLUMN_UUID} AS "reviewUuid"
         FROM ${APPOINTMENT_TABLE_NAME} ${APPOINTMENT_ALIAS}
         INNER JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
             ON ${USER_ALIAS}.${USER_COLUMN_ID} = ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_USER_ID}
         LEFT JOIN ${REVIEW_TABLE_NAME} ${REVIEW_ALIAS}
             ON ${REVIEW_ALIAS}.appointment_id = ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_ID}
            AND ${REVIEW_ALIAS}.customer_id = ${USER_ALIAS}.${USER_COLUMN_ID}
         WHERE ${USER_ALIAS}.${USER_COLUMN_UUID} = $1
           AND ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_UUID} = $2`,
        [userUuid, appointmentUuid],
    )).rows[0];
}

export async function create(review: CreateReview): Promise<Review> {
    try {
        return (await pool.query(
            `INSERT INTO ${REVIEW_TABLE_NAME} (customer_id, appointment_id, rating, comment)
             SELECT ${USER_ALIAS}.${USER_COLUMN_ID}, ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_ID}, $3, $4
             FROM ${USER_TABLE_NAME} ${USER_ALIAS}
             INNER JOIN ${APPOINTMENT_TABLE_NAME} ${APPOINTMENT_ALIAS}
                 ON ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_USER_ID} = ${USER_ALIAS}.${USER_COLUMN_ID}
             WHERE ${USER_ALIAS}.${USER_COLUMN_UUID} = $1
               AND ${APPOINTMENT_ALIAS}.${APPOINTMENT_COLUMN_UUID} = $2
             RETURNING ${COLUMN_UUID},${COLUMN_RATING},${COLUMN_COMMENT},${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC}`,
            [review.userUuid, review.appointmentUuid, review.rating, review.comment],
        )).rows[0];
    } catch (error) {
        mapDatabaseError(error);
    }
}

export async function update(review: UpdateReview): Promise<Review | undefined> {
    try {
        return (await pool.query(
            `UPDATE ${REVIEW_TABLE_NAME} ${REVIEW_ALIAS}
             SET ${COLUMN_RATING} = COALESCE($3, ${REVIEW_ALIAS}.${COLUMN_RATING}),
                 ${COLUMN_COMMENT} = COALESCE($4, ${REVIEW_ALIAS}.${COLUMN_COMMENT}),
                 ${COLUMN_UPDATED_AT_UTC} = NOW()
             FROM ${USER_TABLE_NAME} ${USER_ALIAS}
             WHERE ${REVIEW_ALIAS}.customer_id = ${USER_ALIAS}.${USER_COLUMN_ID}
               AND ${REVIEW_ALIAS}.${COLUMN_UUID} = $1
               AND ${USER_ALIAS}.${USER_COLUMN_UUID} = $2
             RETURNING ${REVIEW_ALIAS}.${COLUMN_UUID},${REVIEW_ALIAS}.${COLUMN_RATING},${REVIEW_ALIAS}.${COLUMN_COMMENT},${REVIEW_ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${REVIEW_ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC}`,
            [review.uuid, review.userUuid, review.rating, review.comment],
        )).rows[0];
    } catch (error) {
        mapDatabaseError(error);
    }
}

export async function remove(uuid: string, userUuid: string): Promise<boolean> {
    const result = await pool.query(
        `DELETE FROM ${REVIEW_TABLE_NAME} ${REVIEW_ALIAS}
         USING ${USER_TABLE_NAME} ${USER_ALIAS}
         WHERE ${REVIEW_ALIAS}.customer_id = ${USER_ALIAS}.${USER_COLUMN_ID}
           AND ${REVIEW_ALIAS}.${COLUMN_UUID} = $1
           AND ${USER_ALIAS}.${USER_COLUMN_UUID} = $2`,
        [uuid, userUuid],
    );

    return result.rowCount !== 0;
}
