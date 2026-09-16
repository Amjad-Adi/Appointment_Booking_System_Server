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
    Appointment,
    AppointmentResponse,
    CreateAppointment,
    QueryAppointment,
} from "../models/appointment.model.js";

import { AppointmentStatus } from "../models/enums/appointment-status.js";
import { PaymentStatus } from "../models/enums/payment-status.js";
import { PaymentMethod } from "../models/enums/payment-method.js";

const workerUsersTable = alias(usersTable, "worker");
const approvalUsersTable = alias(usersTable, "approvalUser");

const appointmentSelect = {
    uuid: appointmentTable.uuid,
    name: appointmentTable.name,

    userUuid: usersTable.uuid,
    organizationUuid: organizationTable.uuid,
    serviceUuid: serviceTable.uuid,
    workerUuid: workerUsersTable.uuid,
    roomUuid: roomTable.uuid,
    approvalUserUuid: approvalUsersTable.uuid,

    userTitle: appointmentTable.userTitle,
    organizationTitle: appointmentTable.organizationTitle,

    userNote: appointmentTable.userNote,
    organizationNote: appointmentTable.organizationNote,

    userColour: appointmentTable.userColour,
    organizationColour: appointmentTable.organizationColour,

    scheduledStartAtUTC: appointmentTable.scheduledStartAtUTC,
    scheduledEndAtUTC: appointmentTable.scheduledEndAtUTC,

    actualStartAtUTC: appointmentTable.actualStartAtUTC,
    actualEndAtUTC: appointmentTable.actualEndAtUTC,

    appointmentStatus: appointmentTable.appointmentStatus,

    rejectionReason: appointmentTable.rejectionReason,

    paymentMethod: appointmentTable.paymentMethod,
    paymentStatus: appointmentTable.paymentStatus,
    paidAtUTC: appointmentTable.paidAtUTC,

    createdAtUTC: appointmentTable.createdAtUTC,
    updatedAtUTC: appointmentTable.updatedAtUTC,
};

const appointmentResponseSelect = {
    ...appointmentSelect,

    userName: sql<string>`
        ${usersTable.firstName} || ' ' || ${usersTable.lastName}
    `,

    organizationName: organizationTable.name,

    serviceName: serviceTable.name,

    workerName: sql<string>`
        ${workerUsersTable.firstName}
        || ' '
        || ${workerUsersTable.lastName}
    `,

    roomName: roomTable.name,

    approvalUserName: sql<string | null>`
        ${approvalUsersTable.firstName}
        || ' '
        || ${approvalUsersTable.lastName}
    `,
};
function buildConditions(query: QueryAppointment): SQL[] {
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

    if (query.filter?.appointmentDate) {
        conditions.push(
            sql`${appointmentTable.scheduledStartAtUTC} >= ${query.filter.appointmentDate}::date AND${appointmentTable.scheduledStartAtUTC} < (${query.filter.appointmentDate}::date + INTERVAL '1 day')`,
        );
    }

    if (query.filter?.fromDate) {
        conditions.push(
            sql`${appointmentTable.scheduledStartAtUTC}>= ${query.filter.fromDate}::date`,
        );
    }

    if (query.filter?.toDate) {
        conditions.push(
            sql`
${appointmentTable.scheduledStartAtUTC}
< (${query.filter.toDate}::date + INTERVAL '1 day')
`,
        );
    }

    if (query.search) {
        const searchValue = `%${query.search}%`;

        conditions.push(
            or(
                ilike(
                    appointmentTable.name,
                    searchValue,
                ),

                ilike(
                    appointmentTable.userNote,
                    searchValue,
                ),

                ilike(
                    appointmentTable.organizationNote,
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
            )!,
        );
    }

    return conditions;
}


function getOrderBy(query: QueryAppointment) {
    const isDescending = query.order === "desc";

    switch (query.sortBy) {
        case "scheduledStartAtUTC":
            return isDescending
                ? desc(appointmentTable.scheduledStartAtUTC)
                : asc(appointmentTable.scheduledStartAtUTC);

        case "scheduledEndAtUTC":
            return isDescending
                ? desc(appointmentTable.scheduledEndAtUTC)
                : asc(appointmentTable.scheduledEndAtUTC);

        case "createdAtUTC":
            return isDescending
                ? desc(appointmentTable.createdAtUTC)
                : asc(appointmentTable.createdAtUTC);

        case "appointmentStatus":
            return isDescending
                ? desc(appointmentTable.appointmentStatus)
                : asc(appointmentTable.appointmentStatus);

        case "paymentStatus":
            return isDescending
                ? desc(appointmentTable.paymentStatus)
                : asc(appointmentTable.paymentStatus);

        case "name":
        default:
            return isDescending
                ? desc(appointmentTable.name)
                : asc(appointmentTable.name);
    }
}

export async function findAll(
    query: QueryAppointment,
): Promise<AppointmentResponse[]> {
    const conditions = buildConditions(query);

    return drizzleConnection
        .select(appointmentResponseSelect)
        .from(appointmentTable)

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
        )

        .orderBy(
            getOrderBy(query),
            asc(appointmentTable.uuid),
        )

        .limit(query.limit)
        .offset(query.offset);
}

export async function countAll(
    query: QueryAppointment,
): Promise<number> {
    const conditions = buildConditions(query);

    const result = await drizzleConnection
        .select({
            count: sql<number>`count(*)`,
        })
        .from(appointmentTable)

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

    return Number(result[0]?.count ?? 0);
}

export async function findByUuid(
    appointmentUuid: string,
    organizationUuid: string | undefined,
): Promise<AppointmentResponse | undefined> {
    const conditions: SQL[] = [
        eq(
            appointmentTable.uuid,
            appointmentUuid,
        ),
    ];

    if (organizationUuid !== undefined) {
        conditions.push(
            eq(
                organizationTable.uuid,
                organizationUuid,
            ),
        );
    }

    const [result] = await drizzleConnection
        .select(appointmentResponseSelect)
        .from(appointmentTable)

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

        .where(and(...conditions));

    return result;
}

export async function findByUuidAndOrganization(
    appointmentUuid: string,
    organizationId: number,
): Promise<AppointmentResponse | undefined> {
    const [result] = await drizzleConnection
        .select(appointmentResponseSelect)
        .from(appointmentTable)

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

export async function findByUuidAndUser(
    appointmentUuid: string,
    userId: number,
): Promise<AppointmentResponse | undefined> {
    const [result] = await drizzleConnection
        .select(appointmentResponseSelect)
        .from(appointmentTable)

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

export async function create(
    appointment: CreateAppointment,
): Promise<Appointment | undefined> {
    const [created] = await drizzleConnection
        .insert(appointmentTable)
        .values({
            name: appointment.name,

            userId: appointment.userId,
            organizationId: appointment.organizationId,
            serviceId: appointment.serviceId,
            workerId: appointment.workerId,
            roomId: appointment.roomId,

            userNote: appointment.userNote ?? null,

            userColour:
                appointment.userColour ?? "#2563EB",

            scheduledStartAtUTC:
            appointment.scheduledStartTimeUTC,

            scheduledEndAtUTC:
            appointment.scheduledEndTimeUTC,

            paymentMethod:
                appointment.paymentMethod ?? null,

            appointmentStatus:
            AppointmentStatus.PENDING_USER_CONFIRMATION,

            paymentStatus:
            PaymentStatus.UNPAID,
        })
        .returning(appointmentSelect);

    return created;
}

export async function updateByUser(
    appointmentUuid: string,
    userId: number,
    updateValues: {
        userNote?: string | null;
        userColour?: string;
    },
): Promise<Appointment | undefined> {
    if (Object.keys(updateValues).length === 0) {
        return undefined;
    }

    const [updated] = await drizzleConnection
        .update(appointmentTable)
        .set({
            ...updateValues,
            updatedAtUTC: new Date().toISOString(),
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
        .returning(appointmentSelect);

    return updated;
}

export async function updateByOrganization(
    appointmentUuid: string,
    organizationId: number,
    updateValues: {
        organizationNote?: string | null;
        organizationColour?: string;
    },
): Promise<Appointment | undefined> {
    if (Object.keys(updateValues).length === 0) {
        return undefined;
    }

    const [updated] = await drizzleConnection
        .update(appointmentTable)
        .set({
            ...updateValues,
            updatedAtUTC: new Date().toISOString(),
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
        .returning(appointmentSelect);

    return updated;
}

export async function confirm(
    appointmentUuid: string,
    organizationId: number,
    approvalUserId: number,
    name: string,
    organizationColour?: string,
    organizationNote?: string | null,
): Promise<Appointment | undefined> {
    const [updated] = await drizzleConnection
        .update(appointmentTable)
        .set({
            name,
            organizationColour,
            organizationNote,
            approvalUserId,

            appointmentStatus:
            AppointmentStatus.PENDING_ORGANIZATION_APPROVAL,

            updatedAtUTC: new Date().toISOString(),
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
        .returning(appointmentSelect);

    return updated;
}

export async function approve(
    appointmentUuid: string,
    organizationId: number,
    approvalUserId: number,
): Promise<Appointment | undefined> {
    const [updated] = await drizzleConnection
        .update(appointmentTable)
        .set({
            approvalUserId,

            appointmentStatus:
            AppointmentStatus.CONFIRMED,

            updatedAtUTC: new Date().toISOString(),
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
        .returning(appointmentSelect);

    return updated;
}

export async function reject(
    appointmentUuid: string,
    organizationId: number,
    approvalUserId: number,
    rejectionReason: string,
): Promise<Appointment | undefined> {
    const [updated] = await drizzleConnection
        .update(appointmentTable)
        .set({
            approvalUserId,
            rejectionReason,

            appointmentStatus:
            AppointmentStatus.REJECTED,

            updatedAtUTC: new Date().toISOString(),
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
        .returning(appointmentSelect);

    return updated;
}

export async function updateStatus(
    appointmentUuid: string,
    organizationId: number,
    appointmentStatus: AppointmentStatus,
): Promise<Appointment | undefined> {
    const [updated] = await drizzleConnection
        .update(appointmentTable)
        .set({
            appointmentStatus,

            updatedAtUTC: new Date().toISOString(),
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
        .returning(appointmentSelect);

    return updated;
}

export async function cancelByUser(
    appointmentUuid: string,
    userId: number,
): Promise<Appointment | undefined> {
    const [updated] = await drizzleConnection
        .update(appointmentTable)
        .set({
            appointmentStatus:
            AppointmentStatus.CANCELLED,

            updatedAtUTC: new Date().toISOString(),
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
        .returning(appointmentSelect);

    return updated;
}

export async function pay(
    appointmentUuid: string,
    userId: number,
    paymentMethod: PaymentMethod,
    ): Promise<Appointment | undefined> {
    const [updated] = await drizzleConnection
        .update(appointmentTable)
        .set({
            paymentMethod,

            paymentStatus:
            PaymentStatus.PAID,

            paidAtUTC:
                new Date().toISOString(),

            updatedAtUTC:
                new Date().toISOString(),
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
        .returning(appointmentSelect);

    return updated;
}