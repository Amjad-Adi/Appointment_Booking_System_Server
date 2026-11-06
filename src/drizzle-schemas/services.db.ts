import { pgTable, bigint, uuid, varchar, timestamp, numeric, integer, text, unique } from "drizzle-orm/pg-core";
import {
    COLUMN_PICTURE_PATH, COLUMN_DURATION_IN_MINUTES, COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC, COLUMN_ORGANIZATION_ID, TABLE_NAME, COLUMN_PICTURE_ID,
    COLUMN_PRICE, COLUMN_STATUS
} from "../databases/contracts/service.contract";
import { organizationTable } from "./organizations.db";
import { ActivationStatus } from "../models/enums/activation-status";

export const serviceTable = pgTable(TABLE_NAME, {
    id: bigint({ mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    uuid: uuid().defaultRandom().unique().notNull(),
    name: varchar({ length: 256 }),
    description: varchar({ length: 4096 }),
    price: numeric(COLUMN_PRICE, { precision: 10, scale: 2, mode: "number" }).notNull(),
    durationInMinutes: integer(COLUMN_DURATION_IN_MINUTES).notNull(),
    organizationId: bigint(COLUMN_ORGANIZATION_ID, { mode: "number" }).notNull().references(() => organizationTable.id, { onUpdate: "cascade", onDelete: "restrict" }),
    picturePath: text(COLUMN_PICTURE_PATH),
    pictureId: text(COLUMN_PICTURE_ID).unique(),
    createdAtUTC: timestamp(COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: timestamp(COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    status: varchar(COLUMN_STATUS, { length: 8 }).$type<ActivationStatus>().notNull().default(ActivationStatus.ACTIVE),
}, (table) => [
    unique("services_organization_id_name_key").on(table.organizationId, table.name),
]);