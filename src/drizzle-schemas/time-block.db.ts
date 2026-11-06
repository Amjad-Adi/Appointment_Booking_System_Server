import { pgTable, bigint, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import {
    COLUMN_REQUESTED_AT_UTC, COLUMN_START_AT_UTC, COLUMN_END_AT_UTC,TABLE_NAME, COLUMN_RESPONDED_AT_UTC, COLUMN_REQUEST_STATUS,
    COLUMN_REQUEST_USER_ID, COLUMN_RESPOND_USER_ID, COLUMN_ORGANIZATION_ID
} from "../databases/contracts/time-block.contract";
import { usersTable } from "./users.db";
import { organizationTable } from "./organizations.db";
import { TimeBlockStatus } from "../models/enums/time-block-status";

export const timeBlockTable = pgTable(TABLE_NAME, {
    id: bigint( { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    uuid: uuid().defaultRandom().unique().notNull(),
    reason: varchar( { length: 4096 }),
    startAtUTC: timestamp(COLUMN_START_AT_UTC, { withTimezone: true, mode: "string" }).notNull(),
    endAtUTC: timestamp(COLUMN_END_AT_UTC, { withTimezone: true, mode: "string" }).notNull(),
    organizationId: bigint(COLUMN_ORGANIZATION_ID, { mode: "number" }).notNull().references(() => organizationTable.id, { onUpdate: "cascade", onDelete: "restrict" }),
    requestUserId: bigint(COLUMN_REQUEST_USER_ID, { mode: "number" }).notNull().references(() => usersTable.id, { onUpdate: "cascade", onDelete: "cascade" }),
    respondUserId: bigint(COLUMN_RESPOND_USER_ID, { mode: "number" }).references(() => usersTable.id, { onUpdate: "cascade", onDelete: "cascade" }),
    requestedAtUTC: timestamp(COLUMN_REQUESTED_AT_UTC, { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    respondedAtUTC: timestamp(COLUMN_RESPONDED_AT_UTC, { withTimezone: true, mode: "string" }),
    requestStatus: varchar(COLUMN_REQUEST_STATUS, { length: 256 }).$type<TimeBlockStatus>().notNull().default(TimeBlockStatus.PENDING),
});