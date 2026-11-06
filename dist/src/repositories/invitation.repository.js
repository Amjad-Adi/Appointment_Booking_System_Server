"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.countAll = countAll;
exports.findPendingByEmailAndOrg = findPendingByEmailAndOrg;
exports.findByTokenHash = findByTokenHash;
exports.create = create;
exports.update = update;
exports.markAccepted = markAccepted;
exports.findByUuid = findByUuid;
const postgre_connection_js_1 = require("../databases/postgre-connection.js");
const invitation_contract_js_1 = require("../databases/contracts/invitation.contract.js");
const organization_contract_js_1 = require("../databases/contracts/organization.contract.js");
const user_contract_js_1 = require("../databases/contracts/user.contract.js");
const order_js_1 = require("../models/enums/order.js");
const invitation_status_js_1 = require("../models/enums/invitation-status.js");
async function findAll(query) {
    const search = query.search
        ? `%${query.search}%`
        : null;
    const sortColumnsDefinition = {
        [invitation_contract_js_1.SORT_BY_CREATED_AT_UTC]: `${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_CREATED_AT_UTC}`,
        [invitation_contract_js_1.SORT_BY_EXPIRES_AT_UTC]: `${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_EXPIRES_AT_UTC}`,
    };
    const sortColumn = sortColumnsDefinition[query.sortBy] ?? sortColumnsDefinition[invitation_contract_js_1.SORT_BY_CREATED_AT_UTC];
    const sortOrder = query.order?.toUpperCase() === order_js_1.Order.ASC
        ? order_js_1.Order.ASC
        : order_js_1.Order.DESC;
    return (await postgre_connection_js_1.pool.query(`SELECT
${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_UUID},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_RECIPIENT_EMAIL}
AS ${invitation_contract_js_1.ALIAS_RECIPIENT_EMAIL},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_ROLE},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_CREATED_AT_UTC}
AS ${invitation_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_EXPIRES_AT_UTC}
AS ${invitation_contract_js_1.ALIAS_COLUMN_EXPIRES_AT_UTC},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_INVITATION_STATUS}
AS ${invitation_contract_js_1.ALIAS_COLUMN_INVITATION_STATUS},

${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UUID}
AS ${invitation_contract_js_1.ALIAS_SENDER_UUID},

${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME}
AS ${invitation_contract_js_1.ALIAS_SENDER_FIRST_NAME},

${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME}
AS ${invitation_contract_js_1.ALIAS_SENDER_LAST_NAME},

${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_EMAIL}
AS ${invitation_contract_js_1.ALIAS_SENDER_EMAIL},

${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH}
AS ${invitation_contract_js_1.ALIAS_SENDER_PROFILE_PICTURE_PATH},

${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID}
AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID},

${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME}
AS ${organization_contract_js_1.ALIAS_COLUMN_NAME},

${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH}
AS ${organization_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH}

FROM ${invitation_contract_js_1.TABLE_NAME} ${invitation_contract_js_1.ALIAS}

INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
ON ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_ORGANIZATION_ID}
= ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}

LEFT JOIN ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS}
ON ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_SENDER_ID}
= ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ID}

WHERE
(
    $1::TEXT IS NULL
OR ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_RECIPIENT_EMAIL} ILIKE $1
)
AND (
    $2::TEXT IS NULL
OR ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_INVITATION_STATUS} = $2
)
AND (
    $3::UUID IS NULL
OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $3
)

ORDER BY
${sortColumn} ${sortOrder},
${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_UUID}

LIMIT $4
OFFSET $5`, [
        search,
        query.filter?.status,
        query.filter?.organizationUuid,
        query.limit,
        query.offset,
    ])).rows;
}
async function countAll(query) {
    const search = query.search
        ? `%${query.search}%`
        : null;
    return Number((await postgre_connection_js_1.pool.query(`SELECT
COUNT(*) AS ${invitation_contract_js_1.ALIAS_TOTAL_NUMBER_OF_INVITATIONS}

FROM ${invitation_contract_js_1.TABLE_NAME} ${invitation_contract_js_1.ALIAS}

INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
ON ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_ORGANIZATION_ID}
= ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}

WHERE
(
    $1::TEXT IS NULL
OR ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_RECIPIENT_EMAIL} ILIKE $1
)
AND (
    $2::TEXT IS NULL
OR ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_INVITATION_STATUS} = $2
)
AND (
    $3::UUID IS NULL
OR ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $3
)`, [
        search,
        query.filter?.status,
        query.filter?.organizationUuid,
    ])).rows[0].totalNumberOfInvitations);
}
async function findPendingByEmailAndOrg(organizationId, email) {
    return ((await postgre_connection_js_1.pool.query(`SELECT 1

FROM ${invitation_contract_js_1.TABLE_NAME} ${invitation_contract_js_1.ALIAS}

WHERE
${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_ORGANIZATION_ID} = $1
AND ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_RECIPIENT_EMAIL} = $2
AND ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_INVITATION_STATUS} = '${invitation_status_js_1.InvitationStatus.PENDING}'

LIMIT 1`, [
        organizationId,
        email,
    ])).rowCount !== 0);
}
async function findByTokenHash(tokenHash) {
    return (await postgre_connection_js_1.pool.query(`SELECT
${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_UUID},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_RECIPIENT_EMAIL}
AS ${invitation_contract_js_1.ALIAS_RECIPIENT_EMAIL},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_ROLE},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_EXPIRES_AT_UTC}
AS ${invitation_contract_js_1.ALIAS_COLUMN_EXPIRES_AT_UTC},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_INVITATION_STATUS}
AS ${invitation_contract_js_1.ALIAS_COLUMN_INVITATION_STATUS},

${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID}
AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID},

${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME}
AS ${organization_contract_js_1.ALIAS_COLUMN_NAME}

FROM ${invitation_contract_js_1.TABLE_NAME} ${invitation_contract_js_1.ALIAS}

INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
ON ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_ORGANIZATION_ID}
= ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}

WHERE
${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_TOKEN_HASH} = $1`, [tokenHash])).rows[0];
}
async function create(invitation) {
    return (await postgre_connection_js_1.pool.query(`INSERT INTO ${invitation_contract_js_1.TABLE_NAME} (
    ${invitation_contract_js_1.COLUMN_ORGANIZATION_ID},
${invitation_contract_js_1.COLUMN_SENDER_ID},
${invitation_contract_js_1.COLUMN_RECIPIENT_EMAIL},
${invitation_contract_js_1.COLUMN_ROLE},
${invitation_contract_js_1.COLUMN_TOKEN_HASH},
${invitation_contract_js_1.COLUMN_EXPIRES_AT_UTC}
)

VALUES ($1, $2, $3, $4, $5, $6)

RETURNING
${invitation_contract_js_1.COLUMN_UUID},

${invitation_contract_js_1.COLUMN_RECIPIENT_EMAIL}
AS ${invitation_contract_js_1.ALIAS_RECIPIENT_EMAIL},

${invitation_contract_js_1.COLUMN_ROLE},

${invitation_contract_js_1.COLUMN_CREATED_AT_UTC}
AS ${invitation_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},

${invitation_contract_js_1.COLUMN_EXPIRES_AT_UTC}
AS ${invitation_contract_js_1.ALIAS_COLUMN_EXPIRES_AT_UTC},

${invitation_contract_js_1.COLUMN_INVITATION_STATUS}
AS ${invitation_contract_js_1.ALIAS_COLUMN_INVITATION_STATUS}`, [
        invitation.organizationId,
        invitation.senderId,
        invitation.email,
        invitation.role,
        invitation.tokenHash,
        invitation.expiresAtUTC,
    ])).rows[0];
}
async function update(invitation) {
    return (await postgre_connection_js_1.pool.query(`UPDATE ${invitation_contract_js_1.TABLE_NAME}

SET
${invitation_contract_js_1.COLUMN_RECIPIENT_EMAIL} =
    COALESCE($1, ${invitation_contract_js_1.COLUMN_RECIPIENT_EMAIL}),

${invitation_contract_js_1.COLUMN_ROLE} =
    COALESCE($2, ${invitation_contract_js_1.COLUMN_ROLE}),

${invitation_contract_js_1.COLUMN_EXPIRES_AT_UTC} =
    COALESCE($3, ${invitation_contract_js_1.COLUMN_EXPIRES_AT_UTC}),

${invitation_contract_js_1.COLUMN_INVITATION_STATUS} =
    COALESCE($4, ${invitation_contract_js_1.COLUMN_INVITATION_STATUS})

WHERE
${invitation_contract_js_1.COLUMN_UUID} = $5

AND ${invitation_contract_js_1.COLUMN_ORGANIZATION_ID} = (
    SELECT ${organization_contract_js_1.COLUMN_ID}

FROM ${organization_contract_js_1.TABLE_NAME}

WHERE ${organization_contract_js_1.COLUMN_UUID} = $6
)

RETURNING
${invitation_contract_js_1.COLUMN_UUID},

${invitation_contract_js_1.COLUMN_RECIPIENT_EMAIL}
AS ${invitation_contract_js_1.ALIAS_RECIPIENT_EMAIL},

${invitation_contract_js_1.COLUMN_ROLE},

${invitation_contract_js_1.COLUMN_CREATED_AT_UTC}
AS ${invitation_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},

${invitation_contract_js_1.COLUMN_EXPIRES_AT_UTC}
AS ${invitation_contract_js_1.ALIAS_COLUMN_EXPIRES_AT_UTC},

${invitation_contract_js_1.COLUMN_INVITATION_STATUS}
AS ${invitation_contract_js_1.ALIAS_COLUMN_INVITATION_STATUS}`, [
        invitation.email ?? null,
        invitation.role ?? null,
        invitation.expiresAtUTC ?? null,
        invitation.status ?? null,
        invitation.uuid,
        invitation.organizationUuid,
    ])).rows[0];
}
async function markAccepted(uuid) {
    await postgre_connection_js_1.pool.query(`UPDATE ${invitation_contract_js_1.TABLE_NAME}

SET
${invitation_contract_js_1.COLUMN_INVITATION_STATUS} = '${invitation_status_js_1.InvitationStatus.ACCEPTED}',
    ${invitation_contract_js_1.COLUMN_ACCEPTED_AT_UTC} = now(),
    ${invitation_contract_js_1.COLUMN_TOKEN_HASH} = NULL

WHERE
${invitation_contract_js_1.COLUMN_UUID} = $1`, [uuid]);
}
async function findByUuid(invitationUuid, organizationUuid) {
    return (await postgre_connection_js_1.pool.query(`SELECT
${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_UUID},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_RECIPIENT_EMAIL}
AS ${invitation_contract_js_1.ALIAS_RECIPIENT_EMAIL},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_ROLE},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_CREATED_AT_UTC}
AS ${invitation_contract_js_1.ALIAS_COLUMN_CREATED_AT_UTC},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_EXPIRES_AT_UTC}
AS ${invitation_contract_js_1.ALIAS_COLUMN_EXPIRES_AT_UTC},

${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_INVITATION_STATUS}
AS ${invitation_contract_js_1.ALIAS_COLUMN_INVITATION_STATUS},

${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_UUID}
AS ${invitation_contract_js_1.ALIAS_SENDER_UUID},

${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_FIRST_NAME}
AS ${invitation_contract_js_1.ALIAS_SENDER_FIRST_NAME},

${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_LAST_NAME}
AS ${invitation_contract_js_1.ALIAS_SENDER_LAST_NAME},

${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_EMAIL}
AS ${invitation_contract_js_1.ALIAS_SENDER_EMAIL},

${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_PROFILE_PICTURE_PATH}
AS ${invitation_contract_js_1.ALIAS_SENDER_PROFILE_PICTURE_PATH},

${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID}
AS ${organization_contract_js_1.ALIAS_COLUMN_ORGANIZATION_UUID},

${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_NAME}
AS ${organization_contract_js_1.ALIAS_COLUMN_NAME},

${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_PROFILE_PICTURE_PATH}
AS ${organization_contract_js_1.ALIAS_COLUMN_PROFILE_PICTURE_PATH}

FROM ${invitation_contract_js_1.TABLE_NAME} ${invitation_contract_js_1.ALIAS}

INNER JOIN ${organization_contract_js_1.TABLE_NAME} ${organization_contract_js_1.ALIAS}
ON ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_ORGANIZATION_ID}
= ${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_ID}

LEFT JOIN ${user_contract_js_1.TABLE_NAME} ${user_contract_js_1.ALIAS}
ON ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_SENDER_ID}
= ${user_contract_js_1.ALIAS}.${user_contract_js_1.COLUMN_ID}

WHERE
${organization_contract_js_1.ALIAS}.${organization_contract_js_1.COLUMN_UUID} = $1
AND ${invitation_contract_js_1.ALIAS}.${invitation_contract_js_1.COLUMN_UUID} = $2`, [
        organizationUuid,
        invitationUuid,
    ])).rows[0];
}
