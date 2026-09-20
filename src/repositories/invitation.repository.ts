import { pool } from "../databases/postgre-connection.js";

import {
    TABLE_NAME,
    COLUMN_UUID,
    COLUMN_ID,
    COLUMN_SENDER_ID,
    COLUMN_ORGANIZATION_ID,
    COLUMN_RECIPIENT_EMAIL,
    COLUMN_ROLE,
    COLUMN_TOKEN_HASH,
    COLUMN_CREATED_AT_UTC,
    COLUMN_EXPIRES_AT_UTC,
    COLUMN_ACCEPTED_AT_UTC,
    COLUMN_INVITATION_STATUS,
    ALIAS,
    ALIAS_COLUMN_CREATED_AT_UTC,
    ALIAS_COLUMN_EXPIRES_AT_UTC,
    ALIAS_COLUMN_INVITATION_STATUS,
    ALIAS_RECIPIENT_EMAIL,
    ALIAS_SENDER_UUID,
    ALIAS_SENDER_FIRST_NAME,
    ALIAS_SENDER_LAST_NAME,
    ALIAS_SENDER_EMAIL,
    ALIAS_SENDER_PROFILE_PICTURE_PATH,
    ALIAS_TOTAL_NUMBER_OF_INVITATIONS,
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_EXPIRES_AT_UTC,
} from "../databases/contracts/invitation.contract.js";

import {
    TABLE_NAME as ORGANIZATION_TABLE_NAME,
    ALIAS as ORGANIZATION_ALIAS,
    COLUMN_ID as ORGANIZATION_COLUMN_ID,
    COLUMN_UUID as ORGANIZATION_COLUMN_UUID,
    COLUMN_NAME as ORGANIZATION_COLUMN_NAME,
    COLUMN_PROFILE_PICTURE_PATH as ORGANIZATION_COLUMN_PROFILE_PICTURE_PATH,
    ALIAS_COLUMN_ORGANIZATION_UUID,
    ALIAS_COLUMN_NAME as ORGANIZATION_ALIAS_COLUMN_NAME,
    ALIAS_COLUMN_PROFILE_PICTURE_PATH as ORGANIZATION_ALIAS_COLUMN_PROFILE_PICTURE_PATH,
} from "../databases/contracts/organization.contract.js";

import {
    TABLE_NAME as USER_TABLE_NAME,
    ALIAS as USER_ALIAS,
    COLUMN_ID as USER_COLUMN_ID,
    COLUMN_UUID as USER_COLUMN_UUID,
    COLUMN_FIRST_NAME as USER_COLUMN_FIRST_NAME,
    COLUMN_LAST_NAME as USER_COLUMN_LAST_NAME,
    COLUMN_EMAIL as USER_COLUMN_EMAIL,
    COLUMN_PROFILE_PICTURE_PATH as USER_COLUMN_PROFILE_PICTURE_PATH,
} from "../databases/contracts/user.contract.js";

import type {
    CreateInvitation,
    Invitation,
    InvitationResponse,
    QueryInvitation,
    UpdateInvitation,
} from "../models/invitation.model.js";

import { Order } from "../models/enums/order.js";
import { InvitationStatus } from "../models/enums/invitation-status.js";

export async function findAll(
    query: QueryInvitation,
): Promise<InvitationResponse[]> {
    const search = query.search
        ? `%${query.search}%`
        : null;

    const sortColumnsDefinition = {
        [SORT_BY_CREATED_AT_UTC]: `${ALIAS}.${COLUMN_CREATED_AT_UTC}`,
        [SORT_BY_EXPIRES_AT_UTC]: `${ALIAS}.${COLUMN_EXPIRES_AT_UTC}`,
    };

    const sortColumn =
        sortColumnsDefinition[
            query.sortBy as keyof typeof sortColumnsDefinition
            ] ?? sortColumnsDefinition[SORT_BY_CREATED_AT_UTC];

    const sortOrder =
        query.order?.toUpperCase() === Order.ASC
            ? Order.ASC
            : Order.DESC;

    return (
        await pool.query(
            `SELECT
${ALIAS}.${COLUMN_UUID},

${ALIAS}.${COLUMN_RECIPIENT_EMAIL}
AS ${ALIAS_RECIPIENT_EMAIL},

${ALIAS}.${COLUMN_ROLE},

${ALIAS}.${COLUMN_CREATED_AT_UTC}
AS ${ALIAS_COLUMN_CREATED_AT_UTC},

${ALIAS}.${COLUMN_EXPIRES_AT_UTC}
AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},

${ALIAS}.${COLUMN_INVITATION_STATUS}
AS ${ALIAS_COLUMN_INVITATION_STATUS},

${USER_ALIAS}.${USER_COLUMN_UUID}
AS ${ALIAS_SENDER_UUID},

${USER_ALIAS}.${USER_COLUMN_FIRST_NAME}
AS ${ALIAS_SENDER_FIRST_NAME},

${USER_ALIAS}.${USER_COLUMN_LAST_NAME}
AS ${ALIAS_SENDER_LAST_NAME},

${USER_ALIAS}.${USER_COLUMN_EMAIL}
AS ${ALIAS_SENDER_EMAIL},

${USER_ALIAS}.${USER_COLUMN_PROFILE_PICTURE_PATH}
AS ${ALIAS_SENDER_PROFILE_PICTURE_PATH},

${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID}
AS ${ALIAS_COLUMN_ORGANIZATION_UUID},

${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME}
AS ${ORGANIZATION_ALIAS_COLUMN_NAME},

${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_PROFILE_PICTURE_PATH}
AS ${ORGANIZATION_ALIAS_COLUMN_PROFILE_PICTURE_PATH}

FROM ${TABLE_NAME} ${ALIAS}

INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}
= ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}

LEFT JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
ON ${ALIAS}.${COLUMN_SENDER_ID}
= ${USER_ALIAS}.${USER_COLUMN_ID}

WHERE
(
    $1::TEXT IS NULL
OR ${ALIAS}.${COLUMN_RECIPIENT_EMAIL} ILIKE $1
)
AND (
    $2::TEXT IS NULL
OR ${ALIAS}.${COLUMN_INVITATION_STATUS} = $2
)
AND (
    $3::UUID IS NULL
OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $3
)

ORDER BY
${sortColumn} ${sortOrder},
${ALIAS}.${COLUMN_UUID}

LIMIT $4
OFFSET $5`,
            [
                search,
                query.filter?.status,
                query.filter?.organizationUuid,
                query.limit,
                query.offset,
            ],
        )
    ).rows;
}

export async function countAll(
    query: QueryInvitation,
): Promise<number> {
    const search = query.search
        ? `%${query.search}%`
        : null;

    return Number(
        (
            await pool.query(
                `SELECT
COUNT(*) AS ${ALIAS_TOTAL_NUMBER_OF_INVITATIONS}

FROM ${TABLE_NAME} ${ALIAS}

INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}
= ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}

WHERE
(
    $1::TEXT IS NULL
OR ${ALIAS}.${COLUMN_RECIPIENT_EMAIL} ILIKE $1
)
AND (
    $2::TEXT IS NULL
OR ${ALIAS}.${COLUMN_INVITATION_STATUS} = $2
)
AND (
    $3::UUID IS NULL
OR ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $3
)`,
                [
                    search,
                    query.filter?.status,
                    query.filter?.organizationUuid,
                ],
            )
        ).rows[0].totalNumberOfInvitations,
    );
}

export async function findPendingByEmailAndOrg(
    organizationId: number,
    email: string,
): Promise<boolean> {
    return (
        (
            await pool.query(
                `SELECT 1

FROM ${TABLE_NAME} ${ALIAS}

WHERE
${ALIAS}.${COLUMN_ORGANIZATION_ID} = $1
AND ${ALIAS}.${COLUMN_RECIPIENT_EMAIL} = $2
AND ${ALIAS}.${COLUMN_INVITATION_STATUS} = '${InvitationStatus.PENDING}'

LIMIT 1`,
                [
                    organizationId,
                    email,
                ],
            )
        ).rowCount !== 0
    );
}

export async function findByTokenHash(
    tokenHash: string,
): Promise<
    | {
    uuid: string;
    recipientEmail: string;
    role: string;
    expiresAtUTC: Date;
    invitationStatus: string;
    organizationUuid: string;
    organizationName: string;
}
    | undefined
> {
    return (
        await pool.query(
            `SELECT
${ALIAS}.${COLUMN_UUID},

${ALIAS}.${COLUMN_RECIPIENT_EMAIL}
AS ${ALIAS_RECIPIENT_EMAIL},

${ALIAS}.${COLUMN_ROLE},

${ALIAS}.${COLUMN_EXPIRES_AT_UTC}
AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},

${ALIAS}.${COLUMN_INVITATION_STATUS}
AS ${ALIAS_COLUMN_INVITATION_STATUS},

${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID}
AS ${ALIAS_COLUMN_ORGANIZATION_UUID},

${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME}
AS ${ORGANIZATION_ALIAS_COLUMN_NAME}

FROM ${TABLE_NAME} ${ALIAS}

INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}
= ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}

WHERE
${ALIAS}.${COLUMN_TOKEN_HASH} = $1`,
            [tokenHash],
        )
    ).rows[0];
}

export async function create(
    invitation: CreateInvitation,
): Promise<Invitation | undefined> {
    return (
        await pool.query(
            `INSERT INTO ${TABLE_NAME} (
    ${COLUMN_ORGANIZATION_ID},
${COLUMN_SENDER_ID},
${COLUMN_RECIPIENT_EMAIL},
${COLUMN_ROLE},
${COLUMN_TOKEN_HASH},
${COLUMN_EXPIRES_AT_UTC}
)

VALUES ($1, $2, $3, $4, $5, $6)

RETURNING
${COLUMN_UUID},

${COLUMN_RECIPIENT_EMAIL}
AS ${ALIAS_RECIPIENT_EMAIL},

${COLUMN_ROLE},

${COLUMN_CREATED_AT_UTC}
AS ${ALIAS_COLUMN_CREATED_AT_UTC},

${COLUMN_EXPIRES_AT_UTC}
AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},

${COLUMN_INVITATION_STATUS}
AS ${ALIAS_COLUMN_INVITATION_STATUS}`,
            [
                invitation.organizationId,
                invitation.senderId,
                invitation.email,
                invitation.role,
                invitation.tokenHash,
                invitation.expiresAtUTC,
            ],
        )
    ).rows[0];
}

export async function update(
    invitation: UpdateInvitation,
): Promise<Invitation | undefined> {
    return (
        await pool.query(
            `UPDATE ${TABLE_NAME}

SET
${COLUMN_RECIPIENT_EMAIL} =
    COALESCE($1, ${COLUMN_RECIPIENT_EMAIL}),

${COLUMN_ROLE} =
    COALESCE($2, ${COLUMN_ROLE}),

${COLUMN_EXPIRES_AT_UTC} =
    COALESCE($3, ${COLUMN_EXPIRES_AT_UTC}),

${COLUMN_INVITATION_STATUS} =
    COALESCE($4, ${COLUMN_INVITATION_STATUS})

WHERE
${COLUMN_UUID} = $5

AND ${COLUMN_ORGANIZATION_ID} = (
    SELECT ${ORGANIZATION_COLUMN_ID}

FROM ${ORGANIZATION_TABLE_NAME}

WHERE ${ORGANIZATION_COLUMN_UUID} = $6
)

RETURNING
${COLUMN_UUID},

${COLUMN_RECIPIENT_EMAIL}
AS ${ALIAS_RECIPIENT_EMAIL},

${COLUMN_ROLE},

${COLUMN_CREATED_AT_UTC}
AS ${ALIAS_COLUMN_CREATED_AT_UTC},

${COLUMN_EXPIRES_AT_UTC}
AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},

${COLUMN_INVITATION_STATUS}
AS ${ALIAS_COLUMN_INVITATION_STATUS}`,
            [
                invitation.email ?? null,
                invitation.role ?? null,
                invitation.expiresAtUTC ?? null,
                invitation.status ?? null,
                invitation.uuid,
                invitation.organizationUuid,
            ],
        )
    ).rows[0];
}

export async function markAccepted(
    uuid: string,
): Promise<void> {
    await pool.query(
        `UPDATE ${TABLE_NAME}

SET
${COLUMN_INVITATION_STATUS} = '${InvitationStatus.ACCEPTED}',
    ${COLUMN_ACCEPTED_AT_UTC} = now(),
    ${COLUMN_TOKEN_HASH} = NULL

WHERE
${COLUMN_UUID} = $1`,
        [uuid],
    );
}

export async function findByUuid(
    invitationUuid: string,
    organizationUuid: string,
): Promise<InvitationResponse | undefined> {
    return (
        await pool.query(
            `SELECT
${ALIAS}.${COLUMN_UUID},

${ALIAS}.${COLUMN_RECIPIENT_EMAIL}
AS ${ALIAS_RECIPIENT_EMAIL},

${ALIAS}.${COLUMN_ROLE},

${ALIAS}.${COLUMN_CREATED_AT_UTC}
AS ${ALIAS_COLUMN_CREATED_AT_UTC},

${ALIAS}.${COLUMN_EXPIRES_AT_UTC}
AS ${ALIAS_COLUMN_EXPIRES_AT_UTC},

${ALIAS}.${COLUMN_INVITATION_STATUS}
AS ${ALIAS_COLUMN_INVITATION_STATUS},

${USER_ALIAS}.${USER_COLUMN_UUID}
AS ${ALIAS_SENDER_UUID},

${USER_ALIAS}.${USER_COLUMN_FIRST_NAME}
AS ${ALIAS_SENDER_FIRST_NAME},

${USER_ALIAS}.${USER_COLUMN_LAST_NAME}
AS ${ALIAS_SENDER_LAST_NAME},

${USER_ALIAS}.${USER_COLUMN_EMAIL}
AS ${ALIAS_SENDER_EMAIL},

${USER_ALIAS}.${USER_COLUMN_PROFILE_PICTURE_PATH}
AS ${ALIAS_SENDER_PROFILE_PICTURE_PATH},

${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID}
AS ${ALIAS_COLUMN_ORGANIZATION_UUID},

${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_NAME}
AS ${ORGANIZATION_ALIAS_COLUMN_NAME},

${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_PROFILE_PICTURE_PATH}
AS ${ORGANIZATION_ALIAS_COLUMN_PROFILE_PICTURE_PATH}

FROM ${TABLE_NAME} ${ALIAS}

INNER JOIN ${ORGANIZATION_TABLE_NAME} ${ORGANIZATION_ALIAS}
ON ${ALIAS}.${COLUMN_ORGANIZATION_ID}
= ${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_ID}

LEFT JOIN ${USER_TABLE_NAME} ${USER_ALIAS}
ON ${ALIAS}.${COLUMN_SENDER_ID}
= ${USER_ALIAS}.${USER_COLUMN_ID}

WHERE
${ORGANIZATION_ALIAS}.${ORGANIZATION_COLUMN_UUID} = $1
AND ${ALIAS}.${COLUMN_UUID} = $2`,
            [
                organizationUuid,
                invitationUuid,
            ],
        )
    ).rows[0];
}