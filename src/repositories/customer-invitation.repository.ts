import { pool } from '../databases/postgres-connection';

import {
    ALIAS as CUSTOMER_INVITATION_ALIAS,
    ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_EXPIRES_AT_UTC,
    ALIAS_COLUMN_ORGANIZATION_NAME,
    ALIAS_COLUMN_ORGANIZATION_PROFILE_PICTURE_PATH,
    ALIAS_COLUMN_ORGANIZATION_UUID,
    ALIAS_COLUMN_RECIPIENT_EMAIL,
    ALIAS_COLUMN_RESPONDED_AT_UTC,
    ALIAS_COLUMN_SENDER_EMAIL,
    ALIAS_COLUMN_SENDER_FIRST_NAME,
    ALIAS_COLUMN_SENDER_LAST_NAME,
    ALIAS_COLUMN_SENDER_UUID,
    ALIAS_COLUMN_STATUS,
    ALIAS_COLUMN_UPDATED_AT_UTC,
    ALIAS_TOTAL_NUMBER_OF_CUSTOMER_INVITATIONS,
    COLUMN_CREATED_AT_UTC,
    COLUMN_EXPIRES_AT_UTC,
    COLUMN_ORGANIZATION_ID,
    COLUMN_RECIPIENT_EMAIL,
    COLUMN_RECIPIENT_USER_ID,
    COLUMN_RESPONDED_AT_UTC,
    COLUMN_SENDER_ID,
    COLUMN_STATUS,
    COLUMN_UPDATED_AT_UTC,
    COLUMN_UUID,
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_EXPIRES_AT_UTC,
    SORT_BY_UPDATED_AT_UTC,
    TABLE_NAME as CUSTOMER_INVITATION_TABLE_NAME,
} from '../databases/contracts/customer-invitation.contract';

import {
    TABLE_NAME as ORGANIZATION_CUSTOMER_TABLE_NAME,
    COLUMN_CUSTOMER_ID as ORGANIZATION_CUSTOMER_COLUMN_CUSTOMER_ID,
    COLUMN_ORGANIZATION_ID as ORGANIZATION_CUSTOMER_COLUMN_ORGANIZATION_ID,
} from '../databases/contracts/organization-customer.contract';

import {
    ALIAS as ORGANIZATION_ALIAS,
    COLUMN_ID as ORGANIZATION_COLUMN_ID,
    COLUMN_NAME as ORGANIZATION_COLUMN_NAME,
    COLUMN_PROFILE_PICTURE_PATH as ORGANIZATION_COLUMN_PROFILE_PICTURE_PATH,
    COLUMN_UUID as ORGANIZATION_COLUMN_UUID,
    TABLE_NAME as ORGANIZATION_TABLE_NAME,
} from '../databases/contracts/organization.contract';

import {
    ALIAS as USER_ALIAS,
    COLUMN_EMAIL as USER_COLUMN_EMAIL,
    COLUMN_FIRST_NAME as USER_COLUMN_FIRST_NAME,
    COLUMN_ID as USER_COLUMN_ID,
    COLUMN_LAST_NAME as USER_COLUMN_LAST_NAME,
    COLUMN_ROLE as USER_COLUMN_ROLE,
    COLUMN_UUID as USER_COLUMN_UUID,
    TABLE_NAME as USER_TABLE_NAME,
} from '../databases/contracts/user.contract';

import { CustomerInvitationStatus } from '../models/enums/customer-invitation-status';
import { Order } from '../models/enums/order';
import { mapDatabaseError } from '../utils/map/map-database-error';
import {
    CreateCustomerInvitation,
    CustomerInvitation,
    CustomerInvitationResponse,
    QueryCustomerInvitation,
    RespondCustomerInvitation,
    UpdateCustomerInvitation,
} from '../models/customer-invitation.model';

const STATUS_COLUMN = `CASE
    WHEN ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_STATUS} = 'PENDING'
         AND ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_EXPIRES_AT_UTC} <= NOW()
        THEN 'EXPIRED'
    ELSE ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_STATUS}
END AS ${ALIAS_COLUMN_STATUS}`;

const SELECT_COLUMNS = `${CUSTOMER_INVITATION_ALIAS}.${COLUMN_UUID},
    ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_RECIPIENT_EMAIL} AS ${ALIAS_COLUMN_RECIPIENT_EMAIL},
    ${STATUS_COLUMN},
    ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},
    ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},
    ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},
    ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_RESPONDED_AT_UTC} AS ${ALIAS_COLUMN_RESPONDED_AT_UTC},
    ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} AS ${ALIAS_COLUMN_ORGANIZATION_UUID},
    ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME} AS ${ALIAS_COLUMN_ORGANIZATION_NAME},
    ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_PROFILE_PICTURE_PATH} AS ${ALIAS_COLUMN_ORGANIZATION_PROFILE_PICTURE_PATH},
    ${USER_ALIAS}.${USER_COLUMN_UUID} AS ${ALIAS_COLUMN_SENDER_UUID},
    ${USER_ALIAS}.${USER_COLUMN_FIRST_NAME} AS ${ALIAS_COLUMN_SENDER_FIRST_NAME},
    ${USER_ALIAS}.${USER_COLUMN_LAST_NAME} AS ${ALIAS_COLUMN_SENDER_LAST_NAME},
    ${USER_ALIAS}.${USER_COLUMN_EMAIL} AS ${ALIAS_COLUMN_SENDER_EMAIL}`;

const FROM_CLAUSE = `FROM ${CUSTOMER_INVITATION_TABLE_NAME} ${CUSTOMER_INVITATION_ALIAS}
    INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
        ON ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID} = ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_ORGANIZATION_ID}
    INNER JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
        ON ${USER_ALIAS}.${USER_COLUMN_ID} = ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_SENDER_ID}`;

const FILTER_CLAUSE = `WHERE ($1::UUID IS NULL OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $1)
    AND ($2::UUID IS NULL OR ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_RECIPIENT_USER_ID} = (SELECT ${USER_COLUMN_ID} FROM ${USER_TABLE_NAME} WHERE ${USER_COLUMN_UUID} = $2))
    AND ($3::TEXT IS NULL OR ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_RECIPIENT_EMAIL} ILIKE $3 OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME} ILIKE $3)
    AND ($4::TEXT IS NULL OR ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_STATUS} = $4)`;

export async function findAll(query: QueryCustomerInvitation): Promise<CustomerInvitationResponse[]> {
    const search = query.search ? `%${query.search}%` : null;
    const sortColumnsDefinition = {
        [SORT_BY_CREATED_AT_UTC]: `${CUSTOMER_INVITATION_ALIAS}.${COLUMN_CREATED_AT_UTC}`,
        [SORT_BY_UPDATED_AT_UTC]: `${CUSTOMER_INVITATION_ALIAS}.${COLUMN_UPDATED_AT_UTC}`,
        [SORT_BY_EXPIRES_AT_UTC]: `${CUSTOMER_INVITATION_ALIAS}.${COLUMN_EXPIRES_AT_UTC}`,
    };
    const sortColumn = sortColumnsDefinition[query.sortBy ?? SORT_BY_CREATED_AT_UTC];
    const sortOrder = query.order?.toUpperCase() ?? Order.DESC;

    return (await pool.query(
        `SELECT ${SELECT_COLUMNS}
         ${FROM_CLAUSE}
         ${FILTER_CLAUSE}
         ORDER BY ${sortColumn} ${sortOrder},${CUSTOMER_INVITATION_ALIAS}.${COLUMN_UUID}
         LIMIT $5
         OFFSET $6`,
        [
            query.organizationUuid ?? null,
            query.userUuid ?? null,
            search,
            query.filter?.status ?? null,
            query.limit,
            query.offset,
        ],
    )).rows;
}

export async function countAll(query: QueryCustomerInvitation): Promise<number> {
    const search = query.search ? `%${query.search}%` : null;

    return Number((await pool.query(
        `SELECT COUNT(*) AS ${ALIAS_TOTAL_NUMBER_OF_CUSTOMER_INVITATIONS}
         ${FROM_CLAUSE}
         ${FILTER_CLAUSE}`,
        [
            query.organizationUuid ?? null,
            query.userUuid ?? null,
            search,
            query.filter?.status ?? null,
        ],
    )).rows[0].totalNumberOfCustomerInvitations);
}

export async function findCustomerByEmail(email: string): Promise<{
    id: number;
    uuid: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
} | undefined> {
    return (await pool.query(
        `SELECT ${USER_COLUMN_ID} AS "id",
                ${USER_COLUMN_UUID} AS "uuid",
                ${USER_COLUMN_EMAIL} AS "email",
                ${USER_COLUMN_FIRST_NAME} AS "firstName",
                ${USER_COLUMN_LAST_NAME} AS "lastName",
                ${USER_COLUMN_ROLE} AS "role"
         FROM ${USER_TABLE_NAME}
         WHERE ${USER_COLUMN_EMAIL} = $1`,
        [email],
    )).rows[0];
}

export async function findPending(
    organizationUuid: string,
    recipientUserId: number,
): Promise<boolean> {
    return (await pool.query(
        `SELECT 1
         FROM ${CUSTOMER_INVITATION_TABLE_NAME} ${CUSTOMER_INVITATION_ALIAS}
         INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
             ON ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID} = ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_ORGANIZATION_ID}
         WHERE ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $1
           AND ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_RECIPIENT_USER_ID} = $2
           AND ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_STATUS} = $3
           AND ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_EXPIRES_AT_UTC} > NOW()`,
        [organizationUuid, recipientUserId, CustomerInvitationStatus.PENDING],
    )).rowCount !== 0;
}

export async function isMember(organizationUuid: string, customerUuid: string): Promise<boolean> {
    return (await pool.query(
        `SELECT 1
         FROM ${ORGANIZATION_CUSTOMER_TABLE_NAME} organization_customer
         INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
             ON ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID} = organization_customer.${ORGANIZATION_CUSTOMER_COLUMN_ORGANIZATION_ID}
         INNER JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
             ON ${USER_ALIAS}.${USER_COLUMN_ID} = organization_customer.${ORGANIZATION_CUSTOMER_COLUMN_CUSTOMER_ID}
         WHERE ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $1
           AND ${USER_ALIAS}.${USER_COLUMN_UUID} = $2`,
        [organizationUuid, customerUuid],
    )).rowCount !== 0;
}

export async function create(
    invitation: Omit<CreateCustomerInvitation, 'expiresAtUTC'> & { recipientUserId: number; expiresAtUTC: Date },
): Promise<CustomerInvitation> {
    try {
        return (await pool.query(
            `INSERT INTO ${CUSTOMER_INVITATION_TABLE_NAME} (${COLUMN_ORGANIZATION_ID}, ${COLUMN_SENDER_ID}, ${COLUMN_RECIPIENT_USER_ID}, ${COLUMN_RECIPIENT_EMAIL}, ${COLUMN_EXPIRES_AT_UTC})
             SELECT ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}, ${USER_ALIAS}.${USER_COLUMN_ID}, $3, $4, $5
             FROM ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
             INNER JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
                 ON ${USER_ALIAS}.${USER_COLUMN_UUID} = $2
             WHERE ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $1
             RETURNING ${COLUMN_UUID},${COLUMN_RECIPIENT_EMAIL} AS ${ALIAS_COLUMN_RECIPIENT_EMAIL},${COLUMN_STATUS} AS "status",${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},${COLUMN_RESPONDED_AT_UTC} AS ${ALIAS_COLUMN_RESPONDED_AT_UTC}`,
            [
                invitation.organizationUuid,
                invitation.senderUuid,
                invitation.recipientUserId,
                invitation.recipientEmail,
                invitation.expiresAtUTC,
            ],
        )).rows[0];
    } catch (error) {
        mapDatabaseError(error);
    }
}

export async function updateByOrganization(
    invitation: UpdateCustomerInvitation,
): Promise<CustomerInvitation | undefined> {
    try {
        return (await pool.query(
            `UPDATE ${CUSTOMER_INVITATION_TABLE_NAME} ${CUSTOMER_INVITATION_ALIAS}
             SET ${COLUMN_STATUS} = $3,
                 ${COLUMN_UPDATED_AT_UTC} = NOW()
             FROM ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
             WHERE ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_ORGANIZATION_ID} = ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}
               AND ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_UUID} = $1
               AND ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $2
               AND ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_STATUS} = $4
             RETURNING ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_UUID},${CUSTOMER_INVITATION_ALIAS}.${COLUMN_RECIPIENT_EMAIL} AS ${ALIAS_COLUMN_RECIPIENT_EMAIL},${CUSTOMER_INVITATION_ALIAS}.${COLUMN_STATUS} AS "status",${CUSTOMER_INVITATION_ALIAS}.${COLUMN_CREATED_AT_UTC} AS ${ALIAS_COLUMN_CREATED_AT_UTC},${CUSTOMER_INVITATION_ALIAS}.${COLUMN_UPDATED_AT_UTC} AS ${ALIAS_COLUMN_UPDATED_AT_UTC},${CUSTOMER_INVITATION_ALIAS}.${COLUMN_EXPIRES_AT_UTC} AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},${CUSTOMER_INVITATION_ALIAS}.${COLUMN_RESPONDED_AT_UTC} AS ${ALIAS_COLUMN_RESPONDED_AT_UTC}`,
            [invitation.uuid, invitation.organizationUuid, invitation.status, CustomerInvitationStatus.PENDING],
        )).rows[0];
    } catch (error) {
        mapDatabaseError(error);
    }
}

export async function respondByCustomer(
    invitation: RespondCustomerInvitation,
): Promise<boolean> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE ${CUSTOMER_INVITATION_TABLE_NAME} ${CUSTOMER_INVITATION_ALIAS}
             SET ${COLUMN_STATUS} = $3,
                 ${COLUMN_RESPONDED_AT_UTC} = NOW(),
                 ${COLUMN_UPDATED_AT_UTC} = NOW()
             FROM ${USER_TABLE_NAME} ${USER_ALIAS}
             WHERE ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_RECIPIENT_USER_ID} = ${USER_ALIAS}.${USER_COLUMN_ID}
               AND ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_UUID} = $1
               AND ${USER_ALIAS}.${USER_COLUMN_UUID} = $2
               AND ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_STATUS} = $4
               AND ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_EXPIRES_AT_UTC} > NOW()
             RETURNING ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_ORGANIZATION_ID} AS "organizationId",
                       ${CUSTOMER_INVITATION_ALIAS}.${COLUMN_RECIPIENT_USER_ID} AS "recipientUserId"`,
            [invitation.uuid, invitation.userUuid, invitation.status, CustomerInvitationStatus.PENDING],
        );

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return false;
        }

        if (invitation.status === CustomerInvitationStatus.ACCEPTED) {
            const row = result.rows[0];
            await client.query(
                `INSERT INTO ${ORGANIZATION_CUSTOMER_TABLE_NAME} (${ORGANIZATION_CUSTOMER_COLUMN_ORGANIZATION_ID}, ${ORGANIZATION_CUSTOMER_COLUMN_CUSTOMER_ID})
                 VALUES ($1, $2)
                 ON CONFLICT (${ORGANIZATION_CUSTOMER_COLUMN_ORGANIZATION_ID}, ${ORGANIZATION_CUSTOMER_COLUMN_CUSTOMER_ID}) DO NOTHING`,
                [row.organizationId, row.recipientUserId],
            );
        }

        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        mapDatabaseError(error);
    } finally {
        client.release();
    }
}
