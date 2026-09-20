import { pgTable, bigint, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

import {
    COLUMN_REQUESTED_AT_UTC,
    COLUMN_START_AT_UTC,
    COLUMN_END_AT_UTC,
    TABLE_NAME,
    COLUMN_RESPONDED_AT_UTC,
    COLUMN_REQUEST_STATUS,
    COLUMN_REQUEST_USER_ID,
    COLUMN_RESPOND_USER_ID,
    COLUMN_ORGANIZATION_ID,
} from "../databases/contracts/time-block.contract.js";

import { timeBlockStatusEnum } from "./enums.js";
import { usersTable } from "./users.db.js";
import { organizationTable } from "./organizations.db.js";
import { TimeBlockStatus } from "../models/enums/time-block-status.js";

export const timeBlockTable = pgTable(TABLE_NAME, {
    id: bigint({ mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),

    uuid: uuid()
        .defaultRandom()
        .unique()
        .notNull(),

    reason: varchar({ length: 4096 }),

    startAtUTC: timestamp(COLUMN_START_AT_UTC, {
        withTimezone: true,
        mode: "string",
    }).notNull(),

    endAtUTC: timestamp(COLUMN_END_AT_UTC, {
        withTimezone: true,
        mode: "string",
    }).notNull(),

    requestUserId: bigint(COLUMN_REQUEST_USER_ID, {
        mode: "number",
    })
        .notNull()
        .references(() => usersTable.id),

    respondUserId: bigint(COLUMN_RESPOND_USER_ID, {
        mode: "number",
    })
        .references(() => usersTable.id),

    organizationId: bigint(COLUMN_ORGANIZATION_ID, {
        mode: "number",
    })
        .notNull()
        .references(() => organizationTable.id),

    requestedAtUTC: timestamp(COLUMN_REQUESTED_AT_UTC, {
        withTimezone: true,
        mode: "string",
    })
        .notNull()
        .defaultNow(),

    respondedAtUTC: timestamp(COLUMN_RESPONDED_AT_UTC, {
        withTimezone: true,
        mode: "string",
    }),

    requestStatus: timeBlockStatusEnum(COLUMN_REQUEST_STATUS)
        .notNull()
        .default(TimeBlockStatus.PENDING),
});