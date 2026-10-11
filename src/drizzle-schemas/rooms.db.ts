import { pgTable, bigint, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import {
    COLUMN_CREATED_AT_UTC, COLUMN_UPDATED_AT_UTC,
    COLUMN_ORGANIZATION_ID, TABLE_NAME, COLUMN_USER_ID
} from "../databases/contracts/room.contract";
import { activationStatusEnum, occupancyStatusEnum } from "./enums";
import { organizationTable } from "./organizations.db";
import { ActivationStatus } from "../models/enums/activation-status";
import { RoomOccupancyStatus } from "../models/enums/room-occupancy-status";
import { usersTable } from "./users.db";
import { unique } from "drizzle-orm/pg-core";

export const roomTable = pgTable(TABLE_NAME, {
    id: bigint({ mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    uuid: uuid().defaultRandom().unique().notNull(),
    name: varchar({ length: 256 }).notNull(),
    description: varchar({ length: 4096 }),
    userId: bigint(COLUMN_USER_ID, { mode: "number" }).references(() => usersTable.id, { onUpdate: "cascade", onDelete: "set null" }),
    organizationId: bigint(COLUMN_ORGANIZATION_ID, { mode: "number" }).notNull().references(() => organizationTable.id, { onUpdate: "cascade", onDelete: "cascade" }),
    createdAtUTC: timestamp(COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: timestamp(COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    status: activationStatusEnum().notNull().default(ActivationStatus.ACTIVE),
    occupancyStatus: occupancyStatusEnum().notNull().default(RoomOccupancyStatus.AVAILABLE),
}, (table) => [
    unique("rooms_organization_name_unique").on(table.organizationId, table.name),
]);