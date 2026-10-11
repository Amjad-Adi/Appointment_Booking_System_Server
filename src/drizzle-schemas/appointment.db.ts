import { pgTable, bigint, uuid, varchar, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
    COLUMN_USER_ID, COLUMN_ORGANIZATION_ID, COLUMN_SERVICE_ID, COLUMN_WORKER_ID,
    COLUMN_ROOM_ID, COLUMN_APPROVAL_USER_ID, COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC, TABLE_NAME, COLUMN_USER_TITLE, COLUMN_ORGANIZATION_TITLE, COLUMN_USER_NOTE,
    COLUMN_ORGANIZATION_NOTE, COLUMN_USER_COLOUR, COLUMN_ORGANIZATION_COLOUR, COLUMN_SCHEDULED_START_AT_UTC,
    COLUMN_SCHEDULED_END_AT_UTC, COLUMN_ACTUAL_START_AT_UTC, COLUMN_ACTUAL_END_AT_UTC, COLUMN_APPOINTMENT_STATUS,
    COLUMN_REJECTION_REASON, COLUMN_PAYMENT_METHOD, COLUMN_PAYMENT_STATUS, COLUMN_PAID_AT_UTC
} from "../databases/contracts/appointment.contract";
import { usersTable } from "./users.db";
import { organizationTable } from "./organizations.db";
import { serviceTable } from "./services.db";
import { roomTable } from "./rooms.db";
import { appointmentStatusEnum, paymentMethodEnum, paymentStatusEnum } from "./enums";
import { AppointmentStatus } from '../models/enums/appointment-status';
import { PaymentStatus } from '../models/enums/payment-status';

export const appointmentTable = pgTable(TABLE_NAME, {
    id: bigint({ mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    uuid: uuid().defaultRandom().unique().notNull(),
    userId: bigint(COLUMN_USER_ID, { mode: "number" }).notNull().references(() => usersTable.id, { onUpdate: "cascade", onDelete: "restrict" }),
    organizationId: bigint(COLUMN_ORGANIZATION_ID, { mode: "number" }).notNull().references(() => organizationTable.id, { onUpdate: "cascade", onDelete: "restrict" }),
    serviceId: bigint(COLUMN_SERVICE_ID, { mode: "number" }).notNull().references(() => serviceTable.id, { onUpdate: "cascade", onDelete: "restrict" }),
    workerId: bigint(COLUMN_WORKER_ID, { mode: "number" }).notNull().references(() => usersTable.id, { onUpdate: "cascade", onDelete: "restrict" }),
    roomId: bigint(COLUMN_ROOM_ID, { mode: "number" }).notNull().references(() => roomTable.id, { onUpdate: "cascade", onDelete: "restrict" }),
    approvalUserId: bigint(COLUMN_APPROVAL_USER_ID, { mode: "number" }).references(() => usersTable.id, { onUpdate: "cascade", onDelete: "set null" }),
    userTitle: varchar(COLUMN_USER_TITLE, { length: 256 }),
    organizationTitle: varchar(COLUMN_ORGANIZATION_TITLE, { length: 256 }),
    userNote: varchar(COLUMN_USER_NOTE, { length: 4096 }),
    organizationNote: varchar(COLUMN_ORGANIZATION_NOTE, { length: 4096 }),
    userColour: varchar(COLUMN_USER_COLOUR, { length: 7 }).notNull().default("#2563EB"),
    organizationColour: varchar(COLUMN_ORGANIZATION_COLOUR, { length: 7 }).notNull().default("#2563EB"),
    scheduledStartAtUTC: timestamp(COLUMN_SCHEDULED_START_AT_UTC, { withTimezone: true, mode: "string" }).notNull(),
    scheduledEndAtUTC: timestamp(COLUMN_SCHEDULED_END_AT_UTC, { withTimezone: true, mode: "string" }).notNull(),
    actualStartAtUTC: timestamp(COLUMN_ACTUAL_START_AT_UTC, { withTimezone: true, mode: "string" }),
    actualEndAtUTC: timestamp(COLUMN_ACTUAL_END_AT_UTC, { withTimezone: true, mode: "string" }),
    appointmentStatus: appointmentStatusEnum(COLUMN_APPOINTMENT_STATUS).notNull().default(AppointmentStatus.PENDING_USER_CONFIRMATION),
    rejectionReason: varchar(COLUMN_REJECTION_REASON, { length: 4096 }),
    paymentMethod: paymentMethodEnum(COLUMN_PAYMENT_METHOD),
    paymentStatus: paymentStatusEnum(COLUMN_PAYMENT_STATUS).notNull().default(PaymentStatus.UNPAID),
    paidAtUTC: timestamp(COLUMN_PAID_AT_UTC, { withTimezone: true, mode: "string" }),
    createdAtUTC: timestamp(COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: timestamp(COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
    check("appointments_scheduled_start_before_end", sql`${table.scheduledStartAtUTC} < ${table.scheduledEndAtUTC}`),
    check("appointments_actual_start_before_end", sql`${table.actualStartAtUTC} IS NULL OR ${table.actualEndAtUTC} IS NULL OR ${table.actualStartAtUTC} < ${table.actualEndAtUTC}`),
    check("appointments_paid_at_check", sql`(${table.paymentStatus} = 'PAID' AND ${table.paidAtUTC} IS NOT NULL) OR (${table.paymentStatus} <> 'PAID' AND ${table.paidAtUTC} IS NULL)`),
]);