import { pgTable, bigint, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";
import {
    COLUMN_PHONE_NUMBER, COLUMN_PROFILE_PICTURE_PATH, COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC, TABLE_NAME, COLUMN_PROFILE_PICTURE_ID, COLUMN_LOCATION_ID
} from "../databases/contracts/organization.contract";
import { activationStatusEnum } from "./enums";
import { ActivationStatus } from "../models/enums/activation-status";
import { locationTable } from "./locations.db";

export const organizationTable = pgTable(TABLE_NAME, {
    id: bigint({ mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    uuid: uuid().defaultRandom().unique().notNull(),
    name: varchar({ length: 256 }).notNull(),
    email: varchar({ length: 320 }).notNull().unique(),
    phoneNumber: varchar(COLUMN_PHONE_NUMBER, { length: 20 }).unique(),
    bio: varchar({ length: 4096 }),
    locationId: bigint(COLUMN_LOCATION_ID, { mode: "number" }).references(() => locationTable.id, { onUpdate: "cascade", onDelete: "set null" }),
    profilePicturePath: text(COLUMN_PROFILE_PICTURE_PATH),
    profilePictureId: text(COLUMN_PROFILE_PICTURE_ID).unique(),
    createdAtUTC: timestamp(COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: timestamp(COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    status: activationStatusEnum().notNull().default(ActivationStatus.ACTIVE),
});