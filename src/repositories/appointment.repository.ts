import { and, asc, count, desc, eq, gte, ilike, inArray, lt, or, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { drizzleConnection } from "../databases/drizzle-connection";
import { appointmentTable } from "../drizzle-schemas/appointment.db";
import { organizationTable } from "../drizzle-schemas/organizations.db";
import { usersTable } from "../drizzle-schemas/users.db";
import { serviceTable } from "../drizzle-schemas/services.db";
import { roomTable } from "../drizzle-schemas/rooms.db";
import { UserAppointmentResponse, OrganizationAppointmentResponse, CreateAppointment, CreateOrganizationAppointment, QueryAppointment, UpdateAppointmentByUserValues, UpdateAppointmentByOrganizationValues, CANCELLABLE_BY_USER_APPOINTMENT_STATUSES } from "../models/appointment.model";
import { AppointmentStatus } from "../models/enums/appointment-status";
import { PaymentStatus } from "../models/enums/payment-status";
import { Order } from '../models/enums/order';

const workerUsersTable = alias(usersTable, "worker");
const approvalUsersTable = alias(usersTable, "approvalUser");

function organizationIdSubquery(organizationUuid: string) {
    return sql<number>`(select ${organizationTable.id} from ${organizationTable} where ${organizationTable.uuid} = ${organizationUuid})`;
}

function userIdSubquery(userUuid: string) {
    return sql<number>`(select ${usersTable.id} from ${usersTable} where ${usersTable.uuid} = ${userUuid})`;
}

function approvalUserIdSubquery(approvalUserUuid: string) {
    return sql<number>`(select ${approvalUsersTable.id} from ${approvalUsersTable} where ${approvalUsersTable.uuid} = ${approvalUserUuid})`;
}

function serviceIdSubquery(serviceUuid: string, organizationUuid: string) {
    return sql<number>`(select ${serviceTable.id} from ${serviceTable} where ${serviceTable.uuid} = ${serviceUuid} and ${serviceTable.organizationId} = ${organizationIdSubquery(organizationUuid)})`;
}

function workerIdSubquery(workerUuid: string, organizationUuid: string) {
    return sql<number>`(select ${usersTable.id} from ${usersTable} where ${usersTable.uuid} = ${workerUuid} and ${usersTable.organizationId} = ${organizationIdSubquery(organizationUuid)})`;
}

function roomIdSubquery(roomId: number, organizationUuid: string) {
    return sql<number>`(select ${roomTable.id} from ${roomTable} where ${roomTable.id} = ${roomId} and ${roomTable.organizationId} = ${organizationIdSubquery(organizationUuid)})`;
}

const DEFAULT_APPOINTMENT_COLOUR = "#2563EB";

function buildConditions(query: QueryAppointment, includeOrganizationPrivateSearch: boolean) {
    const filter = query.filter;
    const conditions: SQL[] = [];

    if (filter?.organizationUuid) {
        conditions.push(eq(organizationTable.uuid, filter.organizationUuid));
    }

    if (filter?.appointmentStatus) {
        conditions.push(eq(appointmentTable.appointmentStatus, filter.appointmentStatus));
    }

    if (filter?.userUuid) {
        conditions.push(eq(usersTable.uuid, filter.userUuid));
    }

    if (filter?.serviceUuid) {
        conditions.push(eq(serviceTable.uuid, filter.serviceUuid));
    }

    if (filter?.workerUuid) {
        conditions.push(eq(workerUsersTable.uuid, filter.workerUuid));
    }

    if (filter?.roomUuid) {
        conditions.push(eq(roomTable.uuid, filter.roomUuid));
    }

    if (filter?.approvalUserUuid) {
        conditions.push(eq(approvalUsersTable.uuid, filter.approvalUserUuid));
    }

    if (filter?.paymentMethod) {
        conditions.push(eq(appointmentTable.paymentMethod, filter.paymentMethod));
    }

    if (filter?.paymentStatus) {
        conditions.push(eq(appointmentTable.paymentStatus, filter.paymentStatus));
    }

    if (filter?.appointmentDate) {
        conditions.push(
            and(
                gte(appointmentTable.scheduledStartAtUTC, sql`${filter.appointmentDate}::date::timestamp AT TIME ZONE 'UTC'`),
                lt(appointmentTable.scheduledStartAtUTC, sql`(${filter.appointmentDate}::date + interval '1 day')::timestamp AT TIME ZONE 'UTC'`),
            )!,
        );
    }

    if (filter?.fromDate) {
        conditions.push(
            gte(appointmentTable.scheduledStartAtUTC, sql`${filter.fromDate}::date::timestamp AT TIME ZONE 'UTC'`),
        );
    }

    if (filter?.toDate) {
        conditions.push(
            lt(appointmentTable.scheduledStartAtUTC, sql`(${filter.toDate}::date + interval '1 day')::timestamp AT TIME ZONE 'UTC'`),
        );
    }

    if (query.search) {
        const searchPattern = `%${query.search}%`;
        const searchConditions: SQL[] = [
            ilike(appointmentTable.userTitle, searchPattern),
            ilike(appointmentTable.userNote, searchPattern),
            ilike(usersTable.firstName, searchPattern),
            ilike(usersTable.lastName, searchPattern),
            ilike(serviceTable.name, searchPattern),
            ilike(workerUsersTable.firstName, searchPattern),
            ilike(workerUsersTable.lastName, searchPattern),
            ilike(roomTable.name, searchPattern),
        ];

        if (includeOrganizationPrivateSearch) {
            searchConditions.push(
                ilike(appointmentTable.organizationTitle, searchPattern),
                ilike(appointmentTable.organizationNote, searchPattern),
                ilike(organizationTable.name, searchPattern),
            );
        }

        conditions.push(or(...searchConditions)!);
    }

    return conditions.length ? and(...conditions) : undefined;
}

function getOrderBy(query: QueryAppointment) {
    const direction = query.order === Order.ASC ? asc : desc;

    switch (query.sortBy) {
        case "scheduledEndAtUTC":
            return direction(appointmentTable.scheduledEndAtUTC);
        case "createdAtUTC":
            return direction(appointmentTable.createdAtUTC);
        default:
            return direction(appointmentTable.scheduledStartAtUTC);
    }
}

function getOrganizationAppointmentQuery() {
    return drizzleConnection
        .select({
            uuid: appointmentTable.uuid,
            userUuid: usersTable.uuid,
            userName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
            organizationUuid: organizationTable.uuid,
            organizationName: organizationTable.name,
            serviceUuid: serviceTable.uuid,
            serviceName: sql<string>`coalesce(${serviceTable.name}, '')`,
            workerUuid: workerUsersTable.uuid,
            workerName: sql<string>`concat(${workerUsersTable.firstName}, ' ', ${workerUsersTable.lastName})`,
            roomUuid: roomTable.uuid,
            roomName: roomTable.name,
            approvalUserUuid: approvalUsersTable.uuid,
            approvalUserName: sql<string | null>`case when ${approvalUsersTable.uuid} is null then null else concat(${approvalUsersTable.firstName}, ' ', ${approvalUsersTable.lastName}) end`,
            organizationTitle: appointmentTable.organizationTitle,
            organizationNote: appointmentTable.organizationNote,
            organizationColour: appointmentTable.organizationColour,
            userTitle: appointmentTable.userTitle,
            userNote: appointmentTable.userNote,
            userColour: appointmentTable.userColour,
            scheduledStartAtUTC: sql<string>`${appointmentTable.scheduledStartAtUTC}::text`,
            scheduledEndAtUTC: sql<string>`${appointmentTable.scheduledEndAtUTC}::text`,
            actualStartAtUTC: sql<string | null>`${appointmentTable.actualStartAtUTC}::text`,
            actualEndAtUTC: sql<string | null>`${appointmentTable.actualEndAtUTC}::text`,
            appointmentStatus: appointmentTable.appointmentStatus,
            rejectionReason: appointmentTable.rejectionReason,
            paymentMethod: appointmentTable.paymentMethod,
            paymentStatus: appointmentTable.paymentStatus,
            paidAtUTC: sql<string | null>`${appointmentTable.paidAtUTC}::text`,
            createdAtUTC: sql<string>`${appointmentTable.createdAtUTC}::text`,
            updatedAtUTC: sql<string>`${appointmentTable.updatedAtUTC}::text`,
        })
        .from(appointmentTable)
        .innerJoin(organizationTable, eq(appointmentTable.organizationId, organizationTable.id))
        .innerJoin(usersTable, eq(appointmentTable.userId, usersTable.id))
        .innerJoin(serviceTable, eq(appointmentTable.serviceId, serviceTable.id))
        .innerJoin(workerUsersTable, eq(appointmentTable.workerId, workerUsersTable.id))
        .innerJoin(roomTable, eq(appointmentTable.roomId, roomTable.id))
        .leftJoin(approvalUsersTable, eq(appointmentTable.approvalUserId, approvalUsersTable.id));
}

function getUserAppointmentQuery() {
    return drizzleConnection
        .select({
            uuid: appointmentTable.uuid,
            userUuid: usersTable.uuid,
            userName: sql<string>`concat(${usersTable.firstName}, ' ', ${usersTable.lastName})`,
            organizationUuid: organizationTable.uuid,
            organizationName: organizationTable.name,
            serviceUuid: serviceTable.uuid,
            serviceName: sql<string>`coalesce(${serviceTable.name}, '')`,
            workerUuid: workerUsersTable.uuid,
            workerName: sql<string>`concat(${workerUsersTable.firstName}, ' ', ${workerUsersTable.lastName})`,
            roomUuid: roomTable.uuid,
            roomName: roomTable.name,
            userTitle: appointmentTable.userTitle,
            userNote: appointmentTable.userNote,
            userColour: appointmentTable.userColour,
            scheduledStartAtUTC: sql<string>`${appointmentTable.scheduledStartAtUTC}::text`,
            scheduledEndAtUTC: sql<string>`${appointmentTable.scheduledEndAtUTC}::text`,
            actualStartAtUTC: sql<string | null>`${appointmentTable.actualStartAtUTC}::text`,
            actualEndAtUTC: sql<string | null>`${appointmentTable.actualEndAtUTC}::text`,
            appointmentStatus: appointmentTable.appointmentStatus,
            rejectionReason: appointmentTable.rejectionReason,
            paymentMethod: appointmentTable.paymentMethod,
            paymentStatus: appointmentTable.paymentStatus,
            paidAtUTC: sql<string | null>`${appointmentTable.paidAtUTC}::text`,
            createdAtUTC: sql<string>`${appointmentTable.createdAtUTC}::text`,
            updatedAtUTC: sql<string>`${appointmentTable.updatedAtUTC}::text`,
        })
        .from(appointmentTable)
        .innerJoin(organizationTable, eq(appointmentTable.organizationId, organizationTable.id))
        .innerJoin(usersTable, eq(appointmentTable.userId, usersTable.id))
        .innerJoin(serviceTable, eq(appointmentTable.serviceId, serviceTable.id))
        .innerJoin(workerUsersTable, eq(appointmentTable.workerId, workerUsersTable.id))
        .innerJoin(roomTable, eq(appointmentTable.roomId, roomTable.id))
        .leftJoin(approvalUsersTable, eq(appointmentTable.approvalUserId, approvalUsersTable.id));
}

export async function findAllOrganization(query: QueryAppointment): Promise<OrganizationAppointmentResponse[]> {
    return getOrganizationAppointmentQuery()
        .where(buildConditions(query, true))
        .orderBy(getOrderBy(query), asc(appointmentTable.uuid))
        .limit(query.limit)
        .offset(query.offset);
}

export async function findAllUser(query: QueryAppointment): Promise<UserAppointmentResponse[]> {
    return getUserAppointmentQuery()
        .where(buildConditions(query, false))
        .orderBy(getOrderBy(query), asc(appointmentTable.uuid))
        .limit(query.limit)
        .offset(query.offset);
}

export async function countAll(query: QueryAppointment, scope: "user" | "organization" = "organization"): Promise<number> {
    const conditions = buildConditions(query, scope === "organization");

    const [result] = await drizzleConnection
        .select({ count: count() })
        .from(appointmentTable)
        .innerJoin(organizationTable, eq(appointmentTable.organizationId, organizationTable.id))
        .innerJoin(usersTable, eq(appointmentTable.userId, usersTable.id))
        .innerJoin(serviceTable, eq(appointmentTable.serviceId, serviceTable.id))
        .innerJoin(workerUsersTable, eq(appointmentTable.workerId, workerUsersTable.id))
        .innerJoin(roomTable, eq(appointmentTable.roomId, roomTable.id))
        .leftJoin(approvalUsersTable, eq(appointmentTable.approvalUserId, approvalUsersTable.id))
        .where(conditions);

    return result?.count ?? 0;
}

export async function findByUuidAndOrganization(appointmentUuid: string, organizationUuid: string): Promise<OrganizationAppointmentResponse | undefined> {
    const [appointment] = await getOrganizationAppointmentQuery()
        .where(and(eq(appointmentTable.uuid, appointmentUuid), eq(organizationTable.uuid, organizationUuid)))
        .limit(1);

    return appointment;
}

export async function findByUuidAndUser(appointmentUuid: string, userUuid: string): Promise<UserAppointmentResponse | undefined> {
    const [appointment] = await getUserAppointmentQuery()
        .where(and(eq(appointmentTable.uuid, appointmentUuid), eq(usersTable.uuid, userUuid)))
        .limit(1);

    return appointment;
}

export async function createByUser(
    appointment: Omit<CreateAppointment, "scheduledStartAtUTC"> & { userUuid: string; roomId: number; scheduledStartAtUTC: Date; scheduledEndAtUTC: Date },
): Promise<UserAppointmentResponse | undefined> {
    const [created] = await drizzleConnection
        .insert(appointmentTable)
        .values({
            userId: userIdSubquery(appointment.userUuid),
            organizationId: organizationIdSubquery(appointment.organizationUuid),
            serviceId: serviceIdSubquery(appointment.serviceUuid, appointment.organizationUuid),
            workerId: workerIdSubquery(appointment.workerUuid, appointment.organizationUuid),
            roomId: roomIdSubquery(appointment.roomId, appointment.organizationUuid),
            userTitle: appointment.userTitle,
            userNote: appointment.userNote ?? null,
            userColour: appointment.userColour ?? DEFAULT_APPOINTMENT_COLOUR,
            scheduledStartAtUTC: appointment.scheduledStartAtUTC.toISOString(),
            scheduledEndAtUTC: appointment.scheduledEndAtUTC.toISOString(),
            paymentMethod: appointment.paymentMethod ?? null,
            appointmentStatus: AppointmentStatus.PENDING_USER_CONFIRMATION,
            paymentStatus: PaymentStatus.UNPAID,
        })
        .returning({ uuid: appointmentTable.uuid });

    return created ? findByUuidAndUser(created.uuid, appointment.userUuid) : undefined;
}

export async function createByOrganization(
    appointment: Omit<CreateOrganizationAppointment, "scheduledStartAtUTC"> & { roomId: number; scheduledStartAtUTC: Date; scheduledEndAtUTC: Date },
): Promise<OrganizationAppointmentResponse | undefined> {
    const [created] = await drizzleConnection
        .insert(appointmentTable)
        .values({
            userId: userIdSubquery(appointment.userUuid),
            organizationId: organizationIdSubquery(appointment.organizationUuid),
            serviceId: serviceIdSubquery(appointment.serviceUuid, appointment.organizationUuid),
            workerId: workerIdSubquery(appointment.workerUuid, appointment.organizationUuid),
            roomId: roomIdSubquery(appointment.roomId, appointment.organizationUuid),
            organizationTitle: appointment.organizationTitle,
            organizationNote: appointment.organizationNote ?? null,
            organizationColour: appointment.organizationColour ?? DEFAULT_APPOINTMENT_COLOUR,
            scheduledStartAtUTC: appointment.scheduledStartAtUTC.toISOString(),
            scheduledEndAtUTC: appointment.scheduledEndAtUTC.toISOString(),
            paymentMethod: appointment.paymentMethod ?? null,
            appointmentStatus: AppointmentStatus.PENDING_USER_CONFIRMATION,
            paymentStatus: PaymentStatus.UNPAID,
        })
        .returning({ uuid: appointmentTable.uuid });

    return created ? findByUuidAndOrganization(created.uuid, appointment.organizationUuid) : undefined;
}

export async function updateByUser(
    appointmentUuid: string,
    userUuid: string,
    updateValues: UpdateAppointmentByUserValues,
): Promise<UserAppointmentResponse | undefined> {
    const values = Object.fromEntries(Object.entries(updateValues).filter(([, value]) => value !== undefined)) as Partial<UpdateAppointmentByUserValues>;

    if (!Object.keys(values).length) {
        return findByUuidAndUser(appointmentUuid, userUuid);
    }

    const [updated] = await drizzleConnection
        .update(appointmentTable)
        .set({ ...values, updatedAtUTC: new Date() })
        .where(and(eq(appointmentTable.uuid, appointmentUuid), eq(appointmentTable.userId, userIdSubquery(userUuid))))
        .returning({ uuid: appointmentTable.uuid });

    return updated ? findByUuidAndUser(updated.uuid, userUuid) : undefined;
}

export async function updateByOrganization(
    appointmentUuid: string,
    organizationUuid: string,
    updateValues: UpdateAppointmentByOrganizationValues,
    approvalUserUuid?: string,
    expectedStatus?: AppointmentStatus,
): Promise<OrganizationAppointmentResponse | undefined> {
    const values = Object.fromEntries(Object.entries(updateValues).filter(([, value]) => value !== undefined)) as Partial<UpdateAppointmentByOrganizationValues>;

    if (!Object.keys(values).length && !approvalUserUuid) {
        return findByUuidAndOrganization(appointmentUuid, organizationUuid);
    }

    const [updated] = await drizzleConnection
        .update(appointmentTable)
        .set({
            ...values,
            ...(values.paymentStatus !== undefined ? {
                paidAtUTC: values.paymentStatus === PaymentStatus.PAID
                    ? sql`COALESCE(${appointmentTable.paidAtUTC}, ${new Date().toISOString()})`
                    : null,
            } : {}),
            ...(approvalUserUuid ? { approvalUserId: approvalUserIdSubquery(approvalUserUuid) } : {}),
            updatedAtUTC: new Date(),
        })
        .where(
            and(
                eq(appointmentTable.uuid, appointmentUuid),
                eq(appointmentTable.organizationId, organizationIdSubquery(organizationUuid)),
                ...(expectedStatus ? [eq(appointmentTable.appointmentStatus, expectedStatus)] : []),
            ),
        )
        .returning({ uuid: appointmentTable.uuid });

    return updated ? findByUuidAndOrganization(updated.uuid, organizationUuid) : undefined;
}

export async function cancelByUser(appointmentUuid: string, userUuid: string): Promise<UserAppointmentResponse | undefined> {
    const [updated] = await drizzleConnection
        .update(appointmentTable)
        .set({ appointmentStatus: AppointmentStatus.CANCELLED, updatedAtUTC: new Date() })
        .where(and(eq(appointmentTable.uuid, appointmentUuid), eq(appointmentTable.userId, userIdSubquery(userUuid)), inArray(appointmentTable.appointmentStatus, CANCELLABLE_BY_USER_APPOINTMENT_STATUSES)))
        .returning({ uuid: appointmentTable.uuid });

    return updated ? findByUuidAndUser(updated.uuid, userUuid) : undefined;
}
