import { pgTable, bigint, uuid, varchar, char, timestamp, text } from "drizzle-orm/pg-core";
import {
    COLUMN_FIRST_NAME, COLUMN_LAST_NAME, COLUMN_UID, COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC, COLUMN_PROFILE_PICTURE_PATH, COLUMN_ORGANIZATION_ID,
    TABLE_NAME, COLUMN_PROFILE_PICTURE_ID, COLUMN_ROLE, COLUMN_STATUS
} from "../databases/contracts/user.contract";
import { organizationTable } from "./organizations.db";
import { ActivationStatus } from "../models/enums/activation-status";
import { Role } from "../models/enums/roles";

export const usersTable = pgTable(TABLE_NAME, {
    id: bigint( { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    uuid: uuid().defaultRandom().unique().notNull(),
    firstName: varchar(COLUMN_FIRST_NAME, { length: 64 }).notNull(),
    lastName: varchar(COLUMN_LAST_NAME, { length: 64 }).notNull(),
    email: varchar({ length: 320 }).notNull().unique(),
    firebaseUid: varchar(COLUMN_UID, { length: 128 }).notNull(),
    profilePicturePath: text(COLUMN_PROFILE_PICTURE_PATH),
    profilePictureId: text(COLUMN_PROFILE_PICTURE_ID).unique(),
    createdAtUTC: timestamp(COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: timestamp(COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    organizationId: bigint(COLUMN_ORGANIZATION_ID, { mode: "number" }).references(() => organizationTable.id, { onUpdate: "cascade", onDelete: "cascade" }),
    language: char( { length: 2 }).notNull().default("en"),
    role: varchar(COLUMN_ROLE, { length: 16 }).$type<Role>().notNull(),
    status: varchar(COLUMN_STATUS, { length: 8 }).$type<ActivationStatus>().notNull().default(ActivationStatus.ACTIVE),
});