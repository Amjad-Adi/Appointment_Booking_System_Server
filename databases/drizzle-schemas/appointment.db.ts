import {drizzleConnection} from "../drizzle-connection";
import {pgTable, bigint, primaryKey, uuid, varchar, date, timestamp, real, integer, text} from "drizzle-orm/pg-core";

import {activationStatusEnum, appointmentStatusEnum, paymentMethodEnum} from "./enums";
import {ActivationStatus} from "../../models/enums/activation-status";
import {
    TABLE_NAME,
    COLUMN_CREATED_AT_UTC,
    COLUMN_USER_ID,
    COLUMN_SCHEDULED_START_AT_UTC,
    COLUMN_APPOINTMENT_STATUS,
    COLUMN_SCHEDULED_END_AT_UTC,
    COLUMN_ACTUAL_START_AT_UTC,
    COLUMN_USER_COLOUR
    ,
    COLUMN_ACTUAL_END_AT_UTC,
    COLUMN_ORGANIZATION_COLOUR,
    COLUMN_PAYMENT_METHOD,
    COLUMN_APPROVAL_USER_ID, COLUMN_ROOM_ID, COLUMN_SERVICE_ID
} from "../contracts/appointment.contract";

import {usersTable} from "./users.db";
import {roomTable} from "./room.db";
import {serviceTable} from "./service.db";
import {DEFAULT_COLOUR} from "../../models/appointment.model";
import {AppointmentStatus} from "../../models/enums/appointment-status";

export const appointmentTable= pgTable(TABLE_NAME,{
    id:bigint({mode:"number"}).primaryKey().generatedAlwaysAsIdentity(),
    uuid:uuid().defaultRandom().unique().notNull(),
    name:varchar({length:256}).notNull(),
    userNote:varchar({length:4096}),
    organizationNote:varchar({length:4096}),
    rejectionReason:varchar({length:4096}),
    createdAtUTC:timestamp(COLUMN_CREATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    scheduledStartAtUTC:timestamp(COLUMN_SCHEDULED_START_AT_UTC,{withTimezone:true}).notNull(),
    scheduledEndAtUTC:timestamp(COLUMN_SCHEDULED_END_AT_UTC,{withTimezone:true}).notNull(),
    actualStartAtUTC:timestamp(COLUMN_ACTUAL_START_AT_UTC,{withTimezone:true}),
    actualEndAtUTC:timestamp(COLUMN_ACTUAL_END_AT_UTC,{withTimezone:true}),
    userColour:varchar(COLUMN_USER_COLOUR,{length:7}).notNull().default(DEFAULT_COLOUR),
    organizationColour:varchar(COLUMN_ORGANIZATION_COLOUR,{length:7}).notNull().default(DEFAULT_COLOUR),
    paymentMethod:paymentMethodEnum(COLUMN_PAYMENT_METHOD).notNull(),
    paidAtUTC:timestamp(COLUMN_SCHEDULED_START_AT_UTC,{withTimezone:true}),
    appointmentStatus:appointmentStatusEnum(COLUMN_APPOINTMENT_STATUS).default(AppointmentStatus.PENDING),
    userId:bigint(COLUMN_USER_ID,{mode:"number"}).notNull().references(()=>usersTable.id),
    approvalUserId:bigint(COLUMN_APPROVAL_USER_ID,{mode:"number"}).references(()=>usersTable.id),
    roomId:bigint(COLUMN_ROOM_ID,{mode:"number"}).notNull().references(()=>roomTable.id),
    serviceId:bigint(COLUMN_SERVICE_ID,{mode:"number"}).notNull().references(()=>serviceTable.id),
})