import { pgTable, bigint, uuid, varchar, timestamp, real, integer, text, unique } from "drizzle-orm/pg-core";
import {
    COLUMN_PICTURE_PATH, COLUMN_DURATION_IN_MINUTES, COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC, COLUMN_ORGANIZATION_ID, TABLE_NAME, COLUMN_PICTURE_ID
} from "../databases/contracts/service.contract";
import { activationStatusEnum } from "./enums";
import { organizationTable } from "./organizations.db";
import { ActivationStatus } from "../models/enums/activation-status";

export const serviceTable = pgTable(TABLE_NAME, {
    id: bigint({ mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    uuid: uuid().defaultRandom().unique().notNull(),
    name: varchar( { length: 256 }).notNull(),
    description: varchar( { length: 4096 }),
    price: real().notNull(),
    durationInMinutes: integer(COLUMN_DURATION_IN_MINUTES).notNull(),
    organizationId: bigint(COLUMN_ORGANIZATION_ID, { mode: "number" }).notNull().references(() => organizationTable.id, { onUpdate: "cascade", onDelete: "restrict" }),
    picturePath: text(COLUMN_PICTURE_PATH),
    pictureId: text(COLUMN_PICTURE_ID).unique(),
    createdAtUTC: timestamp(COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: timestamp(COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    status: activationStatusEnum().notNull().default(ActivationStatus.ACTIVE),
}, (table) => [
    unique("services_organization_name_unique").on(table.organizationId, table.name),
]);