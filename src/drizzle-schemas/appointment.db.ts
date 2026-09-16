import {
    bigint,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

import {
    TABLE_NAME,
    COLUMN_ID,
    COLUMN_UUID,
    COLUMN_NAME,
    COLUMN_USER_ID,
    COLUMN_ORGANIZATION_ID,
    COLUMN_SERVICE_ID,
    COLUMN_WORKER_ID,
    COLUMN_ROOM_ID,
    COLUMN_APPROVAL_USER_ID,
    COLUMN_USER_TITLE,
    COLUMN_ORGANIZATION_TITLE,
    COLUMN_USER_NOTE,
    COLUMN_ORGANIZATION_NOTE,
    COLUMN_USER_COLOUR,
    COLUMN_ORGANIZATION_COLOUR,
    COLUMN_SCHEDULED_START_AT_UTC,
    COLUMN_SCHEDULED_END_AT_UTC,
    COLUMN_ACTUAL_START_AT_UTC,
    COLUMN_ACTUAL_END_AT_UTC,
    COLUMN_APPOINTMENT_STATUS,
    COLUMN_REJECTION_REASON,
    COLUMN_PAYMENT_METHOD,
    COLUMN_PAYMENT_STATUS,
    COLUMN_PAID_AT_UTC,
    COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC,
} from "../databases/contracts/appointment.contract.js";

import { usersTable } from "./users.db.js";
import { organizationTable } from "./organizations.db.js";
import { serviceTable } from "./service.db.js";
import { roomTable } from "./room.db.js";

import { AppointmentStatus } from "../models/enums/appointment-status.js";
import { PaymentMethod } from "../models/enums/payment-method.js";
import { PaymentStatus } from "../models/enums/payment-status.js";


export const appointmentTable = pgTable(
    TABLE_NAME,
    {
        id: bigint(
            COLUMN_ID,
            {
                mode: "number",
            },
        )
            .generatedAlwaysAsIdentity()
            .primaryKey(),

        uuid: uuid(
            COLUMN_UUID,
        )
            .defaultRandom()
            .unique()
            .notNull(),

        name: varchar(
            COLUMN_NAME,
            {
                length: 256,
            },
        ).notNull(),

        userId: bigint(
            COLUMN_USER_ID,
            {
                mode: "number",
            },
        )
            .notNull()
            .references(
                () => usersTable.id,
                {
                    onDelete: "restrict",
                    onUpdate: "cascade",
                },
            ),

        organizationId: bigint(
            COLUMN_ORGANIZATION_ID,
            {
                mode: "number",
            },
        )
            .notNull()
            .references(
                () => organizationTable.id,
                {
                    onDelete: "restrict",
                    onUpdate: "cascade",
                },
            ),

        serviceId: bigint(
            COLUMN_SERVICE_ID,
            {
                mode: "number",
            },
        )
            .notNull()
            .references(
                () => serviceTable.id,
                {
                    onDelete: "restrict",
                    onUpdate: "cascade",
                },
            ),

        workerId: bigint(
            COLUMN_WORKER_ID,
            {
                mode: "number",
            },
        )
            .notNull()
            .references(
                () => usersTable.id,
                {
                    onDelete: "restrict",
                    onUpdate: "cascade",
                },
            ),

        roomId: bigint(
            COLUMN_ROOM_ID,
            {
                mode: "number",
            },
        )
            .notNull()
            .references(
                () => roomTable.id,
                {
                    onDelete: "restrict",
                    onUpdate: "cascade",
                },
            ),

        approvalUserId: bigint(
            COLUMN_APPROVAL_USER_ID,
            {
                mode: "number",
            },
        ).references(
            () => usersTable.id,
            {
                onDelete: "set null",
                onUpdate: "cascade",
            },
        ),

        userTitle: varchar(
            COLUMN_USER_TITLE,
            {
                length: 256,
            },
        ),

        organizationTitle: varchar(
            COLUMN_ORGANIZATION_TITLE,
            {
                length: 256,
            },
        ),

        userNote: varchar(
            COLUMN_USER_NOTE,
            {
                length: 4096,
            },
        ),

        organizationNote: varchar(
            COLUMN_ORGANIZATION_NOTE,
            {
                length: 4096,
            },
        ),

        userColour: varchar(
            COLUMN_USER_COLOUR,
            {
                length: 7,
            },
        )
            .notNull()
            .default("#2563EB"),

        organizationColour: varchar(
            COLUMN_ORGANIZATION_COLOUR,
            {
                length: 7,
            },
        )
            .notNull()
            .default("#2563EB"),

        scheduledStartAtUTC: timestamp(
            COLUMN_SCHEDULED_START_AT_UTC,
            {
                withTimezone: true,
                mode: "date",
            },
        ).notNull(),

        scheduledEndAtUTC: timestamp(
            COLUMN_SCHEDULED_END_AT_UTC,
            {
                withTimezone: true,
                mode: "date",
            },
        ).notNull(),

        actualStartAtUTC: timestamp(
            COLUMN_ACTUAL_START_AT_UTC,
            {
                withTimezone: true,
                mode: "date",
            },
        ),

        actualEndAtUTC: timestamp(
            COLUMN_ACTUAL_END_AT_UTC,
            {
                withTimezone: true,
                mode: "date",
            },
        ),

        appointmentStatus: varchar(
            COLUMN_APPOINTMENT_STATUS,
            {
                length: 64,
            },
        )
            .$type<AppointmentStatus>()
            .notNull()
            .default(
                AppointmentStatus.PENDING_USER_CONFIRMATION,
            ),

        rejectionReason: varchar(
            COLUMN_REJECTION_REASON,
            {
                length: 4096,
            },
        ),

        paymentMethod: varchar(
            COLUMN_PAYMENT_METHOD,
            {
                length: 64,
            },
        ).$type<PaymentMethod>(),

        paymentStatus: varchar(
            COLUMN_PAYMENT_STATUS,
            {
                length: 64,
            },
        )
            .$type<PaymentStatus>()
            .notNull()
            .default(
                PaymentStatus.UNPAID,
            ),

        paidAtUTC: timestamp(
            COLUMN_PAID_AT_UTC,
            {
                withTimezone: true,
                mode: "date",
            },
        ),

        createdAtUTC: timestamp(
            COLUMN_CREATED_AT_UTC,
            {
                withTimezone: true,
                mode: "date",
            },
        )
            .notNull()
            .defaultNow(),

        updatedAtUTC: timestamp(
            COLUMN_UPDATED_AT_UTC,
            {
                withTimezone: true,
                mode: "date",
            },
        )
            .notNull()
            .defaultNow(),
    },
);