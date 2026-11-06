"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllOrganization = findAllOrganization;
exports.findAllUser = findAllUser;
exports.countAll = countAll;
exports.findByUuidAndOrganization = findByUuidAndOrganization;
exports.findByUuidAndUser = findByUuidAndUser;
exports.createByUser = createByUser;
exports.createByOrganization = createByOrganization;
exports.updateByUser = updateByUser;
exports.updateByOrganization = updateByOrganization;
exports.confirm = confirm;
exports.approve = approve;
exports.reject = reject;
exports.updateStatus = updateStatus;
exports.cancelByUser = cancelByUser;
exports.pay = pay;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_connection_js_1 = require("../databases/drizzle-connection.js");
const appointment_db_js_1 = require("../drizzle-schemas/appointment.db.js");
const organizations_db_js_1 = require("../drizzle-schemas/organizations.db.js");
const users_db_js_1 = require("../drizzle-schemas/users.db.js");
const service_db_js_1 = require("../drizzle-schemas/service.db.js");
const room_db_js_1 = require("../drizzle-schemas/room.db.js");
const appointment_status_js_1 = require("../models/enums/appointment-status.js");
const payment_status_js_1 = require("../models/enums/payment-status.js");
const workerUsersTable = (0, pg_core_1.alias)(users_db_js_1.usersTable, "worker");
const approvalUsersTable = (0, pg_core_1.alias)(users_db_js_1.usersTable, "approvalUser");
/*
 * Organization-side appointment select.
 *
 * Includes organization-owned information and
 * related entity names.
 */
const organizationAppointmentSelect = {
    uuid: appointment_db_js_1.appointmentTable.uuid,
    userUuid: users_db_js_1.usersTable.uuid,
    userName: (0, drizzle_orm_1.sql) `
            ${users_db_js_1.usersTable.firstName}
            || ' '
            || ${users_db_js_1.usersTable.lastName}
        `,
    organizationUuid: organizations_db_js_1.organizationTable.uuid,
    organizationName: organizations_db_js_1.organizationTable.name,
    serviceUuid: service_db_js_1.serviceTable.uuid,
    serviceName: service_db_js_1.serviceTable.name,
    workerUuid: workerUsersTable.uuid,
    workerName: (0, drizzle_orm_1.sql) `
            ${workerUsersTable.firstName}
            || ' '
            || ${workerUsersTable.lastName}
        `,
    roomUuid: room_db_js_1.roomTable.uuid,
    roomName: room_db_js_1.roomTable.name,
    approvalUserUuid: approvalUsersTable.uuid,
    approvalUserName: (0, drizzle_orm_1.sql) `
            ${approvalUsersTable.firstName}
            || ' '
            || ${approvalUsersTable.lastName}
        `,
    organizationTitle: appointment_db_js_1.appointmentTable.organizationTitle,
    organizationNote: appointment_db_js_1.appointmentTable.organizationNote,
    organizationColour: appointment_db_js_1.appointmentTable.organizationColour,
    scheduledStartAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.scheduledStartAtUTC}
        `,
    scheduledEndAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.scheduledEndAtUTC}
        `,
    actualStartAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.actualStartAtUTC}
        `,
    actualEndAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.actualEndAtUTC}
        `,
    appointmentStatus: appointment_db_js_1.appointmentTable.appointmentStatus,
    rejectionReason: appointment_db_js_1.appointmentTable.rejectionReason,
    paymentMethod: appointment_db_js_1.appointmentTable.paymentMethod,
    paymentStatus: appointment_db_js_1.appointmentTable.paymentStatus,
    paidAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.paidAtUTC}
        `,
    createdAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.createdAtUTC}
        `,
    updatedAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.updatedAtUTC}
        `,
};
/*
 * User-side appointment select.
 *
 * Organization-private fields are intentionally
 * excluded:
 *
 * - organizationName
 * - organizationTitle
 * - organizationNote
 * - organizationColour
 * - approvalUserUuid
 * - approvalUserName
 */
const userAppointmentSelect = {
    uuid: appointment_db_js_1.appointmentTable.uuid,
    userUuid: users_db_js_1.usersTable.uuid,
    userName: (0, drizzle_orm_1.sql) `
            ${users_db_js_1.usersTable.firstName}
            || ' '
            || ${users_db_js_1.usersTable.lastName}
        `,
    organizationUuid: organizations_db_js_1.organizationTable.uuid,
    organizationName: organizations_db_js_1.organizationTable.name,
    serviceUuid: service_db_js_1.serviceTable.uuid,
    serviceName: service_db_js_1.serviceTable.name,
    workerUuid: workerUsersTable.uuid,
    workerName: (0, drizzle_orm_1.sql) `
            ${workerUsersTable.firstName}
            || ' '
            || ${workerUsersTable.lastName}
        `,
    roomUuid: room_db_js_1.roomTable.uuid,
    roomName: room_db_js_1.roomTable.name,
    userTitle: appointment_db_js_1.appointmentTable.userTitle,
    userNote: appointment_db_js_1.appointmentTable.userNote,
    userColour: appointment_db_js_1.appointmentTable.userColour,
    scheduledStartAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.scheduledStartAtUTC}
        `,
    scheduledEndAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.scheduledEndAtUTC}
        `,
    actualStartAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.actualStartAtUTC}
        `,
    actualEndAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.actualEndAtUTC}
        `,
    appointmentStatus: appointment_db_js_1.appointmentTable.appointmentStatus,
    rejectionReason: appointment_db_js_1.appointmentTable.rejectionReason,
    paymentMethod: appointment_db_js_1.appointmentTable.paymentMethod,
    paymentStatus: appointment_db_js_1.appointmentTable.paymentStatus,
    paidAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.paidAtUTC}
        `,
    createdAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.createdAtUTC}
        `,
    updatedAtUTC: (0, drizzle_orm_1.sql) `
            ${appointment_db_js_1.appointmentTable.updatedAtUTC}
        `,
};
/*
 * Builds common appointment filtering conditions.
 *
 * `includeOrganizationPrivateSearch` is true for
 * organization-side queries and false for user-side
 * queries.
 */
function buildConditions(query, includeOrganizationPrivateSearch) {
    const conditions = [];
    if (query.filter?.organizationUuid) {
        conditions.push((0, drizzle_orm_1.eq)(organizations_db_js_1.organizationTable.uuid, query.filter.organizationUuid));
    }
    if (query.filter?.appointmentStatus) {
        conditions.push((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.appointmentStatus, query.filter.appointmentStatus));
    }
    if (query.filter?.userUuid) {
        conditions.push((0, drizzle_orm_1.eq)(users_db_js_1.usersTable.uuid, query.filter.userUuid));
    }
    if (query.filter?.serviceUuid) {
        conditions.push((0, drizzle_orm_1.eq)(service_db_js_1.serviceTable.uuid, query.filter.serviceUuid));
    }
    if (query.filter?.workerUuid) {
        conditions.push((0, drizzle_orm_1.eq)(workerUsersTable.uuid, query.filter.workerUuid));
    }
    if (query.filter?.roomUuid) {
        conditions.push((0, drizzle_orm_1.eq)(room_db_js_1.roomTable.uuid, query.filter.roomUuid));
    }
    if (query.filter?.approvalUserUuid) {
        conditions.push((0, drizzle_orm_1.eq)(approvalUsersTable.uuid, query.filter.approvalUserUuid));
    }
    if (query.filter?.paymentMethod) {
        conditions.push((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.paymentMethod, query.filter.paymentMethod));
    }
    if (query.filter?.paymentStatus) {
        conditions.push((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.paymentStatus, query.filter.paymentStatus));
    }
    /*
     * Appointment date.
     *
     * >= date
     * < date + 1 day
     */
    if (query.filter?.appointmentDate) {
        conditions.push((0, drizzle_orm_1.sql) `
                ${appointment_db_js_1.appointmentTable.scheduledStartAtUTC}
                >=
                ${query.filter.appointmentDate}::date

                AND

                ${appointment_db_js_1.appointmentTable.scheduledStartAtUTC}
                <
                (
                ${query.filter.appointmentDate}::date
                + INTERVAL '1 day'
                )
            `);
    }
    if (query.filter?.fromDate) {
        conditions.push((0, drizzle_orm_1.sql) `
                ${appointment_db_js_1.appointmentTable.scheduledStartAtUTC}
                >=
                ${query.filter.fromDate}::date
            `);
    }
    if (query.filter?.toDate) {
        conditions.push((0, drizzle_orm_1.sql) `
                ${appointment_db_js_1.appointmentTable.scheduledStartAtUTC}
                <
                (
                ${query.filter.toDate}::date
                + INTERVAL '1 day'
                )
            `);
    }
    if (query.search) {
        const searchValue = `%${query.search}%`;
        const searchConditions = [
            (0, drizzle_orm_1.ilike)(appointment_db_js_1.appointmentTable.userTitle, searchValue),
            (0, drizzle_orm_1.ilike)(appointment_db_js_1.appointmentTable.userNote, searchValue),
            (0, drizzle_orm_1.ilike)((0, drizzle_orm_1.sql) `
                    ${users_db_js_1.usersTable.firstName}
                    || ' '
                    || ${users_db_js_1.usersTable.lastName}
                `, searchValue),
            (0, drizzle_orm_1.ilike)(service_db_js_1.serviceTable.name, searchValue),
            (0, drizzle_orm_1.ilike)((0, drizzle_orm_1.sql) `
                    ${workerUsersTable.firstName}
                    || ' '
                    || ${workerUsersTable.lastName}
                `, searchValue),
            (0, drizzle_orm_1.ilike)(room_db_js_1.roomTable.name, searchValue),
        ];
        /*
         * Organization-private fields may only be
         * searched from organization-side queries.
         */
        if (includeOrganizationPrivateSearch) {
            searchConditions.push((0, drizzle_orm_1.ilike)(appointment_db_js_1.appointmentTable.organizationTitle, searchValue), (0, drizzle_orm_1.ilike)(appointment_db_js_1.appointmentTable.organizationNote, searchValue), (0, drizzle_orm_1.ilike)(organizations_db_js_1.organizationTable.name, searchValue));
        }
        const searchCondition = (0, drizzle_orm_1.or)(...searchConditions);
        if (searchCondition) {
            conditions.push(searchCondition);
        }
    }
    return conditions;
}
/*
 * Appointment ordering.
 */
function getOrderBy(query) {
    const isDescending = query.order === "desc";
    switch (query.sortBy) {
        case "scheduledStartAtUTC":
            return isDescending
                ? (0, drizzle_orm_1.desc)(appointment_db_js_1.appointmentTable.scheduledStartAtUTC)
                : (0, drizzle_orm_1.asc)(appointment_db_js_1.appointmentTable.scheduledStartAtUTC);
        case "scheduledEndAtUTC":
            return isDescending
                ? (0, drizzle_orm_1.desc)(appointment_db_js_1.appointmentTable.scheduledEndAtUTC)
                : (0, drizzle_orm_1.asc)(appointment_db_js_1.appointmentTable.scheduledEndAtUTC);
        case "createdAtUTC":
            return isDescending
                ? (0, drizzle_orm_1.desc)(appointment_db_js_1.appointmentTable.createdAtUTC)
                : (0, drizzle_orm_1.asc)(appointment_db_js_1.appointmentTable.createdAtUTC);
        default:
            return isDescending
                ? (0, drizzle_orm_1.desc)(appointment_db_js_1.appointmentTable.scheduledStartAtUTC)
                : (0, drizzle_orm_1.asc)(appointment_db_js_1.appointmentTable.scheduledStartAtUTC);
    }
}
/*
 * Organization-side query.
 *
 * All related entities are joined here so the
 * response contains both UUIDs and display names.
 */
function getOrganizationAppointmentQuery() {
    return drizzle_connection_js_1.drizzleConnection
        .select(organizationAppointmentSelect)
        .from(appointment_db_js_1.appointmentTable)
        .innerJoin(organizations_db_js_1.organizationTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.organizationId, organizations_db_js_1.organizationTable.id))
        .innerJoin(users_db_js_1.usersTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.userId, users_db_js_1.usersTable.id))
        .innerJoin(service_db_js_1.serviceTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.serviceId, service_db_js_1.serviceTable.id))
        .innerJoin(room_db_js_1.roomTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.roomId, room_db_js_1.roomTable.id))
        .innerJoin(workerUsersTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.workerId, workerUsersTable.id))
        .leftJoin(approvalUsersTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.approvalUserId, approvalUsersTable.id));
}
/*
 * User-side query.
 *
 * Organization is joined because organizationUuid
 * belongs to UserAppointmentResponse.
 *
 * Organization-private fields are never selected.
 */
function getUserAppointmentQuery() {
    return drizzle_connection_js_1.drizzleConnection
        .select(userAppointmentSelect)
        .from(appointment_db_js_1.appointmentTable)
        .innerJoin(organizations_db_js_1.organizationTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.organizationId, organizations_db_js_1.organizationTable.id))
        .innerJoin(users_db_js_1.usersTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.userId, users_db_js_1.usersTable.id))
        .innerJoin(service_db_js_1.serviceTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.serviceId, service_db_js_1.serviceTable.id))
        .innerJoin(room_db_js_1.roomTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.roomId, room_db_js_1.roomTable.id))
        .innerJoin(workerUsersTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.workerId, workerUsersTable.id));
}
/*
 * Find all organization appointments.
 */
async function findAllOrganization(query) {
    const conditions = buildConditions(query, true);
    return getOrganizationAppointmentQuery()
        .where(conditions.length > 0
        ? (0, drizzle_orm_1.and)(...conditions)
        : undefined)
        .orderBy(getOrderBy(query), (0, drizzle_orm_1.asc)(appointment_db_js_1.appointmentTable.uuid))
        .limit(query.limit)
        .offset(query.offset);
}
/*
 * Find all user appointments.
 */
async function findAllUser(query) {
    const conditions = buildConditions(query, false);
    return getUserAppointmentQuery()
        .where(conditions.length > 0
        ? (0, drizzle_orm_1.and)(...conditions)
        : undefined)
        .orderBy(getOrderBy(query), (0, drizzle_orm_1.asc)(appointment_db_js_1.appointmentTable.uuid))
        .limit(query.limit)
        .offset(query.offset);
}
/*
 * Count appointments.
 */
async function countAll(query) {
    const conditions = buildConditions(query, true);
    const result = await drizzle_connection_js_1.drizzleConnection
        .select({
        count: (0, drizzle_orm_1.sql) `count(*)`,
    })
        .from(appointment_db_js_1.appointmentTable)
        .innerJoin(organizations_db_js_1.organizationTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.organizationId, organizations_db_js_1.organizationTable.id))
        .innerJoin(users_db_js_1.usersTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.userId, users_db_js_1.usersTable.id))
        .innerJoin(service_db_js_1.serviceTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.serviceId, service_db_js_1.serviceTable.id))
        .innerJoin(room_db_js_1.roomTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.roomId, room_db_js_1.roomTable.id))
        .innerJoin(workerUsersTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.workerId, workerUsersTable.id))
        .leftJoin(approvalUsersTable, (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.approvalUserId, approvalUsersTable.id))
        .where(conditions.length > 0
        ? (0, drizzle_orm_1.and)(...conditions)
        : undefined);
    return Number(result[0]?.count ?? 0);
}
/*
 * Find organization appointment by UUID.
 */
async function findByUuidAndOrganization(appointmentUuid, organizationId) {
    const [result] = await getOrganizationAppointmentQuery()
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.uuid, appointmentUuid), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.organizationId, organizationId)));
    return result;
}
/*
 * Find user appointment by UUID.
 */
async function findByUuidAndUser(appointmentUuid, userId) {
    const [result] = await getUserAppointmentQuery()
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.uuid, appointmentUuid), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.userId, userId)));
    return result;
}
/*
 * CUSTOMER / USER CREATION.
 */
async function createByUser(appointment) {
    const [created] = await drizzle_connection_js_1.drizzleConnection
        .insert(appointment_db_js_1.appointmentTable)
        .values({
        userId: appointment.userId,
        organizationId: appointment.organizationId,
        serviceId: appointment.serviceId,
        workerId: appointment.workerId,
        roomId: appointment.roomId,
        userTitle: appointment.userTitle ??
            null,
        userNote: appointment.userNote ??
            null,
        userColour: appointment.userColour ??
            "#2563EB",
        scheduledStartAtUTC: appointment.scheduledStartAtUTC,
        scheduledEndAtUTC: appointment.scheduledEndAtUTC,
        paymentMethod: appointment.paymentMethod ??
            null,
        appointmentStatus: appointment_status_js_1.AppointmentStatus.PENDING_USER_CONFIRMATION,
        paymentStatus: payment_status_js_1.PaymentStatus.UNPAID,
    })
        .returning({
        uuid: appointment_db_js_1.appointmentTable.uuid,
    });
    if (!created) {
        return undefined;
    }
    return findByUuidAndUser(created.uuid, appointment.userId);
}
/*
 * ORGANIZATION CREATION.
 */
async function createByOrganization(appointment) {
    const [created] = await drizzle_connection_js_1.drizzleConnection
        .insert(appointment_db_js_1.appointmentTable)
        .values({
        userId: appointment.userId,
        organizationId: appointment.organizationId,
        serviceId: appointment.serviceId,
        workerId: appointment.workerId,
        roomId: appointment.roomId,
        organizationTitle: appointment.organizationTitle ??
            null,
        organizationNote: appointment.organizationNote ??
            null,
        organizationColour: appointment.organizationColour ??
            "#2563EB",
        scheduledStartAtUTC: appointment.scheduledStartAtUTC,
        scheduledEndAtUTC: appointment.scheduledEndAtUTC,
        paymentMethod: appointment.paymentMethod,
        appointmentStatus: appointment_status_js_1.AppointmentStatus.PENDING_USER_CONFIRMATION,
        paymentStatus: payment_status_js_1.PaymentStatus.UNPAID,
    })
        .returning({
        uuid: appointment_db_js_1.appointmentTable.uuid,
    });
    if (!created) {
        return undefined;
    }
    return findByUuidAndOrganization(created.uuid, appointment.organizationId);
}
/*
 * Update user-owned appointment fields.
 */
async function updateByUser(appointmentUuid, userId, updateValues) {
    if (Object.keys(updateValues).length === 0) {
        return undefined;
    }
    const [updated] = await drizzle_connection_js_1.drizzleConnection
        .update(appointment_db_js_1.appointmentTable)
        .set({
        ...updateValues,
        updatedAtUTC: new Date(),
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.uuid, appointmentUuid), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.userId, userId)))
        .returning({
        uuid: appointment_db_js_1.appointmentTable.uuid,
    });
    if (!updated) {
        return undefined;
    }
    return findByUuidAndUser(updated.uuid, userId);
}
/*
 * Update organization-owned appointment fields.
 */
async function updateByOrganization(appointmentUuid, organizationId, updateValues) {
    if (Object.keys(updateValues).length === 0) {
        return undefined;
    }
    const [updated] = await drizzle_connection_js_1.drizzleConnection
        .update(appointment_db_js_1.appointmentTable)
        .set({
        ...updateValues,
        updatedAtUTC: new Date(),
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.uuid, appointmentUuid), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.organizationId, organizationId)))
        .returning({
        uuid: appointment_db_js_1.appointmentTable.uuid,
    });
    if (!updated) {
        return undefined;
    }
    return findByUuidAndOrganization(updated.uuid, organizationId);
}
/*
 * Confirm appointment.
 *
 * The current confirmAppointmentSchema still
 * contains `name`.
 *
 * Since appointmentTable.name no longer exists,
 * the incoming name is stored as organizationTitle.
 */
async function confirm(appointmentUuid, organizationId, approvalUserId, name, organizationColour, organizationNote) {
    const [updated] = await drizzle_connection_js_1.drizzleConnection
        .update(appointment_db_js_1.appointmentTable)
        .set({
        organizationTitle: name,
        organizationColour: organizationColour ??
            "#2563EB",
        organizationNote,
        approvalUserId,
        appointmentStatus: appointment_status_js_1.AppointmentStatus.PENDING_ORGANIZATION_APPROVAL,
        updatedAtUTC: new Date(),
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.uuid, appointmentUuid), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.organizationId, organizationId), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.appointmentStatus, appointment_status_js_1.AppointmentStatus.PENDING_USER_CONFIRMATION)))
        .returning({
        uuid: appointment_db_js_1.appointmentTable.uuid,
    });
    if (!updated) {
        return undefined;
    }
    return findByUuidAndOrganization(updated.uuid, organizationId);
}
/*
 * Approve appointment.
 */
async function approve(appointmentUuid, organizationId, approvalUserId) {
    const [updated] = await drizzle_connection_js_1.drizzleConnection
        .update(appointment_db_js_1.appointmentTable)
        .set({
        approvalUserId,
        appointmentStatus: appointment_status_js_1.AppointmentStatus.CONFIRMED,
        updatedAtUTC: new Date(),
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.uuid, appointmentUuid), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.organizationId, organizationId), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.appointmentStatus, appointment_status_js_1.AppointmentStatus.PENDING_ORGANIZATION_APPROVAL)))
        .returning({
        uuid: appointment_db_js_1.appointmentTable.uuid,
    });
    if (!updated) {
        return undefined;
    }
    return findByUuidAndOrganization(updated.uuid, organizationId);
}
/*
 * Reject appointment.
 */
async function reject(appointmentUuid, organizationId, approvalUserId, rejectionReason) {
    const [updated] = await drizzle_connection_js_1.drizzleConnection
        .update(appointment_db_js_1.appointmentTable)
        .set({
        approvalUserId,
        rejectionReason,
        appointmentStatus: appointment_status_js_1.AppointmentStatus.REJECTED,
        updatedAtUTC: new Date(),
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.uuid, appointmentUuid), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.organizationId, organizationId), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.appointmentStatus, appointment_status_js_1.AppointmentStatus.PENDING_ORGANIZATION_APPROVAL)))
        .returning({
        uuid: appointment_db_js_1.appointmentTable.uuid,
    });
    if (!updated) {
        return undefined;
    }
    return findByUuidAndOrganization(updated.uuid, organizationId);
}
/*
 * Update appointment status.
 */
async function updateStatus(appointmentUuid, organizationId, appointmentStatus) {
    const [updated] = await drizzle_connection_js_1.drizzleConnection
        .update(appointment_db_js_1.appointmentTable)
        .set({
        appointmentStatus,
        updatedAtUTC: new Date(),
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.uuid, appointmentUuid), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.organizationId, organizationId)))
        .returning({
        uuid: appointment_db_js_1.appointmentTable.uuid,
    });
    if (!updated) {
        return undefined;
    }
    return findByUuidAndOrganization(updated.uuid, organizationId);
}
/*
 * Cancel appointment by customer/user.
 */
async function cancelByUser(appointmentUuid, userId) {
    const [updated] = await drizzle_connection_js_1.drizzleConnection
        .update(appointment_db_js_1.appointmentTable)
        .set({
        appointmentStatus: appointment_status_js_1.AppointmentStatus.CANCELLED,
        updatedAtUTC: new Date(),
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.uuid, appointmentUuid), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.userId, userId)))
        .returning({
        uuid: appointment_db_js_1.appointmentTable.uuid,
    });
    if (!updated) {
        return undefined;
    }
    return findByUuidAndUser(updated.uuid, userId);
}
/*
 * Pay appointment.
 */
async function pay(appointmentUuid, userId, paymentMethod) {
    const [updated] = await drizzle_connection_js_1.drizzleConnection
        .update(appointment_db_js_1.appointmentTable)
        .set({
        paymentMethod,
        paymentStatus: payment_status_js_1.PaymentStatus.PAID,
        paidAtUTC: new Date(),
        updatedAtUTC: new Date(),
    })
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.uuid, appointmentUuid), (0, drizzle_orm_1.eq)(appointment_db_js_1.appointmentTable.userId, userId)))
        .returning({
        uuid: appointment_db_js_1.appointmentTable.uuid,
    });
    if (!updated) {
        return undefined;
    }
    return findByUuidAndUser(updated.uuid, userId);
}
