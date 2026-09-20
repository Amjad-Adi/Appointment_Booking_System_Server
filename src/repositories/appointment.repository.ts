import {
    and,
    asc,
    desc,
    eq,
    ilike,
    or,
    sql,
    type SQL,
} from "drizzle-orm";

import { alias } from "drizzle-orm/pg-core";

import { drizzleConnection } from "../databases/drizzle-connection.js";

import { appointmentTable } from "../drizzle-schemas/appointment.db.js";
import { organizationTable } from "../drizzle-schemas/organizations.db.js";
import { usersTable } from "../drizzle-schemas/users.db.js";
import { serviceTable } from "../drizzle-schemas/service.db.js";
import { roomTable } from "../drizzle-schemas/room.db.js";

import type {
    UserAppointmentResponse,
    OrganizationAppointmentResponse,
    CreateAppointment,
    CreateOrganizationAppointment,
    QueryAppointment,
} from "../models/appointment.model.js";

import { AppointmentStatus } from "../models/enums/appointment-status.js";
import { PaymentStatus } from "../models/enums/payment-status.js";
import { PaymentMethod } from "../models/enums/payment-method.js";


const workerUsersTable =
    alias(
        usersTable,
        "worker",
    );

const approvalUsersTable =
    alias(
        usersTable,
        "approvalUser",
    );


/*
 * Organization-side appointment select.
 *
 * Includes organization-owned information and
 * related entity names.
 */
const organizationAppointmentSelect = {
    uuid:
    appointmentTable.uuid,

    userUuid:
    usersTable.uuid,

    userName:
        sql<string>`
            ${usersTable.firstName}
            || ' '
            || ${usersTable.lastName}
        `,

    organizationUuid:
    organizationTable.uuid,

    organizationName:
    organizationTable.name,

    serviceUuid:
    serviceTable.uuid,

    serviceName:
    serviceTable.name,

    workerUuid:
    workerUsersTable.uuid,

    workerName:
        sql<string>`
            ${workerUsersTable.firstName}
            || ' '
            || ${workerUsersTable.lastName}
        `,

    roomUuid:
    roomTable.uuid,

    roomName:
    roomTable.name,

    approvalUserUuid:
    approvalUsersTable.uuid,

    approvalUserName:
        sql<string | null>`
            ${approvalUsersTable.firstName}
            || ' '
            || ${approvalUsersTable.lastName}
        `,

    organizationTitle:
    appointmentTable.organizationTitle,

    organizationNote:
    appointmentTable.organizationNote,

    organizationColour:
    appointmentTable.organizationColour,

    scheduledStartAtUTC:
        sql<string>`
            ${appointmentTable.scheduledStartAtUTC}
        `,

    scheduledEndAtUTC:
        sql<string>`
            ${appointmentTable.scheduledEndAtUTC}
        `,

    actualStartAtUTC:
        sql<string | null>`
            ${appointmentTable.actualStartAtUTC}
        `,

    actualEndAtUTC:
        sql<string | null>`
            ${appointmentTable.actualEndAtUTC}
        `,

    appointmentStatus:
    appointmentTable.appointmentStatus,

    rejectionReason:
    appointmentTable.rejectionReason,

    paymentMethod:
    appointmentTable.paymentMethod,

    paymentStatus:
    appointmentTable.paymentStatus,

    paidAtUTC:
        sql<string | null>`
            ${appointmentTable.paidAtUTC}
        `,

    createdAtUTC:
        sql<string>`
            ${appointmentTable.createdAtUTC}
        `,

    updatedAtUTC:
        sql<string>`
            ${appointmentTable.updatedAtUTC}
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
    uuid:
    appointmentTable.uuid,

    userUuid:
    usersTable.uuid,

    userName:
        sql<string>`
            ${usersTable.firstName}
            || ' '
            || ${usersTable.lastName}
        `,

    organizationUuid:
    organizationTable.uuid,

    organizationName:
    organizationTable.name,
    serviceUuid:
    serviceTable.uuid,

    serviceName:
    serviceTable.name,

    workerUuid:
    workerUsersTable.uuid,

    workerName:
        sql<string>`
            ${workerUsersTable.firstName}
            || ' '
            || ${workerUsersTable.lastName}
        `,

    roomUuid:
    roomTable.uuid,

    roomName:
    roomTable.name,

    userTitle:
    appointmentTable.userTitle,

    userNote:
    appointmentTable.userNote,

    userColour:
    appointmentTable.userColour,

    scheduledStartAtUTC:
        sql<string>`
            ${appointmentTable.scheduledStartAtUTC}
        `,

    scheduledEndAtUTC:
        sql<string>`
            ${appointmentTable.scheduledEndAtUTC}
        `,

    actualStartAtUTC:
        sql<string | null>`
            ${appointmentTable.actualStartAtUTC}
        `,

    actualEndAtUTC:
        sql<string | null>`
            ${appointmentTable.actualEndAtUTC}
        `,

    appointmentStatus:
    appointmentTable.appointmentStatus,

    rejectionReason:
    appointmentTable.rejectionReason,

    paymentMethod:
    appointmentTable.paymentMethod,

    paymentStatus:
    appointmentTable.paymentStatus,

    paidAtUTC:
        sql<string | null>`
            ${appointmentTable.paidAtUTC}
        `,

    createdAtUTC:
        sql<string>`
            ${appointmentTable.createdAtUTC}
        `,

    updatedAtUTC:
        sql<string>`
            ${appointmentTable.updatedAtUTC}
        `,
};


/*
 * Builds common appointment filtering conditions.
 *
 * `includeOrganizationPrivateSearch` is true for
 * organization-side queries and false for user-side
 * queries.
 */
function buildConditions(
    query: QueryAppointment,
    includeOrganizationPrivateSearch: boolean,
): SQL[] {
    const conditions: SQL[] = [];

    if (query.filter?.organizationUuid) {
        conditions.push(
            eq(
                organizationTable.uuid,
                query.filter.organizationUuid,
            ),
        );
    }

    if (query.filter?.appointmentStatus) {
        conditions.push(
            eq(
                appointmentTable.appointmentStatus,
                query.filter.appointmentStatus,
            ),
        );
    }

    if (query.filter?.userUuid) {
        conditions.push(
            eq(
                usersTable.uuid,
                query.filter.userUuid,
            ),
        );
    }

    if (query.filter?.serviceUuid) {
        conditions.push(
            eq(
                serviceTable.uuid,
                query.filter.serviceUuid,
            ),
        );
    }

    if (query.filter?.workerUuid) {
        conditions.push(
            eq(
                workerUsersTable.uuid,
                query.filter.workerUuid,
            ),
        );
    }

    if (query.filter?.roomUuid) {
        conditions.push(
            eq(
                roomTable.uuid,
                query.filter.roomUuid,
            ),
        );
    }

    if (query.filter?.approvalUserUuid) {
        conditions.push(
            eq(
                approvalUsersTable.uuid,
                query.filter.approvalUserUuid,
            ),
        );
    }

    if (query.filter?.paymentMethod) {
        conditions.push(
            eq(
                appointmentTable.paymentMethod,
                query.filter.paymentMethod,
            ),
        );
    }

    if (query.filter?.paymentStatus) {
        conditions.push(
            eq(
                appointmentTable.paymentStatus,
                query.filter.paymentStatus,
            ),
        );
    }

    /*
     * Appointment date.
     *
     * >= date
     * < date + 1 day
     */
    if (query.filter?.appointmentDate) {
        conditions.push(
            sql`
                ${appointmentTable.scheduledStartAtUTC}
                >=
                ${query.filter.appointmentDate}::date

                AND

                ${appointmentTable.scheduledStartAtUTC}
                <
                (
                ${query.filter.appointmentDate}::date
                + INTERVAL '1 day'
                )
            `,
        );
    }

    if (query.filter?.fromDate) {
        conditions.push(
            sql`
                ${appointmentTable.scheduledStartAtUTC}
                >=
                ${query.filter.fromDate}::date
            `,
        );
    }

    if (query.filter?.toDate) {
        conditions.push(
            sql`
                ${appointmentTable.scheduledStartAtUTC}
                <
                (
                ${query.filter.toDate}::date
                + INTERVAL '1 day'
                )
            `,
        );
    }

    if (query.search) {
        const searchValue =
            `%${query.search}%`;

        const searchConditions: SQL[] = [
            ilike(
                appointmentTable.userTitle,
                searchValue,
            ),

            ilike(
                appointmentTable.userNote,
                searchValue,
            ),

            ilike(
                sql<string>`
                    ${usersTable.firstName}
                    || ' '
                    || ${usersTable.lastName}
                `,
                searchValue,
            ),

            ilike(
                serviceTable.name,
                searchValue,
            ),

            ilike(
                sql<string>`
                    ${workerUsersTable.firstName}
                    || ' '
                    || ${workerUsersTable.lastName}
                `,
                searchValue,
            ),

            ilike(
                roomTable.name,
                searchValue,
            ),
        ];

        /*
         * Organization-private fields may only be
         * searched from organization-side queries.
         */
        if (includeOrganizationPrivateSearch) {
            searchConditions.push(
                ilike(
                    appointmentTable.organizationTitle,
                    searchValue,
                ),

                ilike(
                    appointmentTable.organizationNote,
                    searchValue,
                ),

                ilike(
                    organizationTable.name,
                    searchValue,
                ),
            );
        }

        const searchCondition =
            or(...searchConditions);

        if (searchCondition) {
            conditions.push(
                searchCondition,
            );
        }
    }

    return conditions;
}


/*
 * Appointment ordering.
 */
function getOrderBy(
    query: QueryAppointment,
) {
    const isDescending =
        query.order === "desc";

    switch (query.sortBy) {
        case "scheduledStartAtUTC":
            return isDescending
                ? desc(
                    appointmentTable.scheduledStartAtUTC,
                )
                : asc(
                    appointmentTable.scheduledStartAtUTC,
                );

        case "scheduledEndAtUTC":
            return isDescending
                ? desc(
                    appointmentTable.scheduledEndAtUTC,
                )
                : asc(
                    appointmentTable.scheduledEndAtUTC,
                );

        case "createdAtUTC":
            return isDescending
                ? desc(
                    appointmentTable.createdAtUTC,
                )
                : asc(
                    appointmentTable.createdAtUTC,
                );

        default:
            return isDescending
                ? desc(
                    appointmentTable.scheduledStartAtUTC,
                )
                : asc(
                    appointmentTable.scheduledStartAtUTC,
                );
    }
}


/*
 * Organization-side query.
 *
 * All related entities are joined here so the
 * response contains both UUIDs and display names.
 */
function getOrganizationAppointmentQuery() {
    return drizzleConnection
        .select(
            organizationAppointmentSelect,
        )
        .from(
            appointmentTable,
        )
        .innerJoin(
            organizationTable,
            eq(
                appointmentTable.organizationId,
                organizationTable.id,
            ),
        )
        .innerJoin(
            usersTable,
            eq(
                appointmentTable.userId,
                usersTable.id,
            ),
        )
        .innerJoin(
            serviceTable,
            eq(
                appointmentTable.serviceId,
                serviceTable.id,
            ),
        )
        .innerJoin(
            roomTable,
            eq(
                appointmentTable.roomId,
                roomTable.id,
            ),
        )
        .innerJoin(
            workerUsersTable,
            eq(
                appointmentTable.workerId,
                workerUsersTable.id,
            ),
        )
        .leftJoin(
            approvalUsersTable,
            eq(
                appointmentTable.approvalUserId,
                approvalUsersTable.id,
            ),
        );
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
    return drizzleConnection
        .select(
            userAppointmentSelect,
        )
        .from(
            appointmentTable,
        )
        .innerJoin(
            organizationTable,
            eq(
                appointmentTable.organizationId,
                organizationTable.id,
            ),
        )
        .innerJoin(
            usersTable,
            eq(
                appointmentTable.userId,
                usersTable.id,
            ),
        )
        .innerJoin(
            serviceTable,
            eq(
                appointmentTable.serviceId,
                serviceTable.id,
            ),
        )
        .innerJoin(
            roomTable,
            eq(
                appointmentTable.roomId,
                roomTable.id,
            ),
        )
        .innerJoin(
            workerUsersTable,
            eq(
                appointmentTable.workerId,
                workerUsersTable.id,
            ),
        );
}


/*
 * Find all organization appointments.
 */
export async function findAllOrganization(
    query: QueryAppointment,
): Promise<
    OrganizationAppointmentResponse[]
> {
    const conditions =
        buildConditions(
            query,
            true,
        );

    return getOrganizationAppointmentQuery()
        .where(
            conditions.length > 0
                ? and(...conditions)
                : undefined,
        )
        .orderBy(
            getOrderBy(query),
            asc(
                appointmentTable.uuid,
            ),
        )
        .limit(
            query.limit,
        )
        .offset(
            query.offset,
        );
}


/*
 * Find all user appointments.
 */
export async function findAllUser(
    query: QueryAppointment,
): Promise<
    UserAppointmentResponse[]
> {
    const conditions =
        buildConditions(
            query,
            false,
        );

    return getUserAppointmentQuery()
        .where(
            conditions.length > 0
                ? and(...conditions)
                : undefined,
        )
        .orderBy(
            getOrderBy(query),
            asc(
                appointmentTable.uuid,
            ),
        )
        .limit(
            query.limit,
        )
        .offset(
            query.offset,
        );
}


/*
 * Count appointments.
 */
export async function countAll(
    query: QueryAppointment,
): Promise<number> {
    const conditions =
        buildConditions(
            query,
            true,
        );

    const result =
        await drizzleConnection
            .select({
                count:
                    sql<number>`count(*)`,
            })
            .from(
                appointmentTable,
            )
            .innerJoin(
                organizationTable,
                eq(
                    appointmentTable.organizationId,
                    organizationTable.id,
                ),
            )
            .innerJoin(
                usersTable,
                eq(
                    appointmentTable.userId,
                    usersTable.id,
                ),
            )
            .innerJoin(
                serviceTable,
                eq(
                    appointmentTable.serviceId,
                    serviceTable.id,
                ),
            )
            .innerJoin(
                roomTable,
                eq(
                    appointmentTable.roomId,
                    roomTable.id,
                ),
            )
            .innerJoin(
                workerUsersTable,
                eq(
                    appointmentTable.workerId,
                    workerUsersTable.id,
                ),
            )
            .leftJoin(
                approvalUsersTable,
                eq(
                    appointmentTable.approvalUserId,
                    approvalUsersTable.id,
                ),
            )
            .where(
                conditions.length > 0
                    ? and(...conditions)
                    : undefined,
            );

    return Number(
        result[0]?.count ?? 0,
    );
}


/*
 * Find organization appointment by UUID.
 */
export async function findByUuidAndOrganization(
    appointmentUuid: string,
    organizationId: number,
): Promise<
    OrganizationAppointmentResponse | undefined
> {
    const [result] =
        await getOrganizationAppointmentQuery()
            .where(
                and(
                    eq(
                        appointmentTable.uuid,
                        appointmentUuid,
                    ),

                    eq(
                        appointmentTable.organizationId,
                        organizationId,
                    ),
                ),
            );

    return result;
}


/*
 * Find user appointment by UUID.
 */
export async function findByUuidAndUser(
    appointmentUuid: string,
    userId: number,
): Promise<
    UserAppointmentResponse | undefined
> {
    const [result] =
        await getUserAppointmentQuery()
            .where(
                and(
                    eq(
                        appointmentTable.uuid,
                        appointmentUuid,
                    ),

                    eq(
                        appointmentTable.userId,
                        userId,
                    ),
                ),
            );

    return result;
}


/*
 * CUSTOMER / USER CREATION.
 */
export async function createByUser(
    appointment: CreateAppointment,
): Promise<
    UserAppointmentResponse | undefined
> {
    const [created] =
        await drizzleConnection
            .insert(
                appointmentTable,
            )
            .values({
                userId:
                appointment.userId,

                organizationId:
                appointment.organizationId,

                serviceId:
                appointment.serviceId,

                workerId:
                appointment.workerId,

                roomId:
                appointment.roomId,

                userTitle:
                    appointment.userTitle ??
                    null,

                userNote:
                    appointment.userNote ??
                    null,

                userColour:
                    appointment.userColour ??
                    "#2563EB",

                scheduledStartAtUTC:
                appointment.scheduledStartAtUTC,

                scheduledEndAtUTC:
                appointment.scheduledEndAtUTC,

                paymentMethod:
                    appointment.paymentMethod ??
                    null,

                appointmentStatus:
                AppointmentStatus.PENDING_USER_CONFIRMATION,

                paymentStatus:
                PaymentStatus.UNPAID,
            })
            .returning({
                uuid:
                appointmentTable.uuid,
            });

    if (!created) {
        return undefined;
    }

    return findByUuidAndUser(
        created.uuid,
        appointment.userId,
    );
}


/*
 * ORGANIZATION CREATION.
 */
export async function createByOrganization(
    appointment: CreateOrganizationAppointment,
): Promise<
    OrganizationAppointmentResponse | undefined
> {
    const [created] =
        await drizzleConnection
            .insert(
                appointmentTable,
            )
            .values({
                userId:
                appointment.userId,

                organizationId:
                appointment.organizationId,

                serviceId:
                appointment.serviceId,

                workerId:
                appointment.workerId,

                roomId:
                appointment.roomId,

                organizationTitle:
                    appointment.organizationTitle ??
                    null,

                organizationNote:
                    appointment.organizationNote ??
                    null,

                organizationColour:
                    appointment.organizationColour ??
                    "#2563EB",

                scheduledStartAtUTC:
                appointment.scheduledStartAtUTC,

                scheduledEndAtUTC:
                appointment.scheduledEndAtUTC,

                paymentMethod:
                appointment.paymentMethod,

                appointmentStatus:
                AppointmentStatus.PENDING_USER_CONFIRMATION,

                paymentStatus:
                PaymentStatus.UNPAID,
            })
            .returning({
                uuid:
                appointmentTable.uuid,
            });

    if (!created) {
        return undefined;
    }

    return findByUuidAndOrganization(
        created.uuid,
        appointment.organizationId,
    );
}


/*
 * Update user-owned appointment fields.
 */
export async function updateByUser(
    appointmentUuid: string,
    userId: number,
    updateValues: {
        userTitle?: string | null;
        userNote?: string | null;
        userColour?: string;
    },
): Promise<
    UserAppointmentResponse | undefined
> {
    if (
        Object.keys(updateValues).length === 0
    ) {
        return undefined;
    }

    const [updated] =
        await drizzleConnection
            .update(
                appointmentTable,
            )
            .set({
                ...updateValues,

                updatedAtUTC:
                    new Date(),
            })
            .where(
                and(
                    eq(
                        appointmentTable.uuid,
                        appointmentUuid,
                    ),

                    eq(
                        appointmentTable.userId,
                        userId,
                    ),
                ),
            )
            .returning({
                uuid:
                appointmentTable.uuid,
            });

    if (!updated) {
        return undefined;
    }

    return findByUuidAndUser(
        updated.uuid,
        userId,
    );
}


/*
 * Update organization-owned appointment fields.
 */
export async function updateByOrganization(
    appointmentUuid: string,
    organizationId: number,
    updateValues: {
        organizationTitle?: string | null;
        organizationNote?: string | null;
        organizationColour?: string;
    },
): Promise<
    OrganizationAppointmentResponse | undefined
> {
    if (
        Object.keys(updateValues).length === 0
    ) {
        return undefined;
    }

    const [updated] =
        await drizzleConnection
            .update(
                appointmentTable,
            )
            .set({
                ...updateValues,

                updatedAtUTC:
                    new Date(),
            })
            .where(
                and(
                    eq(
                        appointmentTable.uuid,
                        appointmentUuid,
                    ),

                    eq(
                        appointmentTable.organizationId,
                        organizationId,
                    ),
                ),
            )
            .returning({
                uuid:
                appointmentTable.uuid,
            });

    if (!updated) {
        return undefined;
    }

    return findByUuidAndOrganization(
        updated.uuid,
        organizationId,
    );
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
export async function confirm(
    appointmentUuid: string,
    organizationId: number,
    approvalUserId: number,
    name: string,
    organizationColour?: string,
    organizationNote?: string | null,
): Promise<
    OrganizationAppointmentResponse | undefined
> {
    const [updated] =
        await drizzleConnection
            .update(
                appointmentTable,
            )
            .set({
                organizationTitle:
                name,

                organizationColour:
                    organizationColour ??
                    "#2563EB",

                organizationNote,

                approvalUserId,

                appointmentStatus:
                AppointmentStatus.PENDING_ORGANIZATION_APPROVAL,

                updatedAtUTC:
                    new Date(),
            })
            .where(
                and(
                    eq(
                        appointmentTable.uuid,
                        appointmentUuid,
                    ),

                    eq(
                        appointmentTable.organizationId,
                        organizationId,
                    ),

                    eq(
                        appointmentTable.appointmentStatus,
                        AppointmentStatus.PENDING_USER_CONFIRMATION,
                    ),
                ),
            )
            .returning({
                uuid:
                appointmentTable.uuid,
            });

    if (!updated) {
        return undefined;
    }

    return findByUuidAndOrganization(
        updated.uuid,
        organizationId,
    );
}


/*
 * Approve appointment.
 */
export async function approve(
    appointmentUuid: string,
    organizationId: number,
    approvalUserId: number,
): Promise<
    OrganizationAppointmentResponse | undefined
> {
    const [updated] =
        await drizzleConnection
            .update(
                appointmentTable,
            )
            .set({
                approvalUserId,

                appointmentStatus:
                AppointmentStatus.CONFIRMED,

                updatedAtUTC:
                    new Date(),
            })
            .where(
                and(
                    eq(
                        appointmentTable.uuid,
                        appointmentUuid,
                    ),

                    eq(
                        appointmentTable.organizationId,
                        organizationId,
                    ),

                    eq(
                        appointmentTable.appointmentStatus,
                        AppointmentStatus.PENDING_ORGANIZATION_APPROVAL,
                    ),
                ),
            )
            .returning({
                uuid:
                appointmentTable.uuid,
            });

    if (!updated) {
        return undefined;
    }

    return findByUuidAndOrganization(
        updated.uuid,
        organizationId,
    );
}


/*
 * Reject appointment.
 */
export async function reject(
    appointmentUuid: string,
    organizationId: number,
    approvalUserId: number,
    rejectionReason: string,
): Promise<
    OrganizationAppointmentResponse | undefined
> {
    const [updated] =
        await drizzleConnection
            .update(
                appointmentTable,
            )
            .set({
                approvalUserId,

                rejectionReason,

                appointmentStatus:
                AppointmentStatus.REJECTED,

                updatedAtUTC:
                    new Date(),
            })
            .where(
                and(
                    eq(
                        appointmentTable.uuid,
                        appointmentUuid,
                    ),

                    eq(
                        appointmentTable.organizationId,
                        organizationId,
                    ),

                    eq(
                        appointmentTable.appointmentStatus,
                        AppointmentStatus.PENDING_ORGANIZATION_APPROVAL,
                    ),
                ),
            )
            .returning({
                uuid:
                appointmentTable.uuid,
            });

    if (!updated) {
        return undefined;
    }

    return findByUuidAndOrganization(
        updated.uuid,
        organizationId,
    );
}


/*
 * Update appointment status.
 */
export async function updateStatus(
    appointmentUuid: string,
    organizationId: number,
    appointmentStatus: AppointmentStatus,
): Promise<
    OrganizationAppointmentResponse | undefined
> {
    const [updated] =
        await drizzleConnection
            .update(
                appointmentTable,
            )
            .set({
                appointmentStatus,

                updatedAtUTC:
                    new Date(),
            })
            .where(
                and(
                    eq(
                        appointmentTable.uuid,
                        appointmentUuid,
                    ),

                    eq(
                        appointmentTable.organizationId,
                        organizationId,
                    ),
                ),
            )
            .returning({
                uuid:
                appointmentTable.uuid,
            });

    if (!updated) {
        return undefined;
    }

    return findByUuidAndOrganization(
        updated.uuid,
        organizationId,
    );
}


/*
 * Cancel appointment by customer/user.
 */
export async function cancelByUser(
    appointmentUuid: string,
    userId: number,
): Promise<
    UserAppointmentResponse | undefined
> {
    const [updated] =
        await drizzleConnection
            .update(
                appointmentTable,
            )
            .set({
                appointmentStatus:
                AppointmentStatus.CANCELLED,

                updatedAtUTC:
                    new Date(),
            })
            .where(
                and(
                    eq(
                        appointmentTable.uuid,
                        appointmentUuid,
                    ),

                    eq(
                        appointmentTable.userId,
                        userId,
                    ),
                ),
            )
            .returning({
                uuid:
                appointmentTable.uuid,
            });

    if (!updated) {
        return undefined;
    }

    return findByUuidAndUser(
        updated.uuid,
        userId,
    );
}


/*
 * Pay appointment.
 */
export async function pay(
    appointmentUuid: string,
    userId: number,
    paymentMethod: PaymentMethod,
): Promise<
    UserAppointmentResponse | undefined
> {
    const [updated] =
        await drizzleConnection
            .update(
                appointmentTable,
            )
            .set({
                paymentMethod,

                paymentStatus:
                PaymentStatus.PAID,

                paidAtUTC:
                    new Date(),

                updatedAtUTC:
                    new Date(),
            })
            .where(
                and(
                    eq(
                        appointmentTable.uuid,
                        appointmentUuid,
                    ),

                    eq(
                        appointmentTable.userId,
                        userId,
                    ),
                ),
            )
            .returning({
                uuid:
                appointmentTable.uuid,
            });

    if (!updated) {
        return undefined;
    }

    return findByUuidAndUser(
        updated.uuid,
        userId,
    );
}