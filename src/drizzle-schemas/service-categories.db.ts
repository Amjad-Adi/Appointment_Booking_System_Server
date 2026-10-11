import { pgTable, bigint, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";
import {
    COLUMN_CREATED_AT_UTC, COLUMN_UPDATED_AT_UTC, TABLE_NAME
} from "../databases/contracts/service-category.contract";
import { activationStatusEnum } from "./enums";
import { ActivationStatus } from "../models/enums/activation-status";
import { COLUMN_PICTURE_ID, COLUMN_PICTURE_PATH } from '../databases/contracts/service.contract';

export const serviceCategoryTable = pgTable(TABLE_NAME, {
    id: bigint({ mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    uuid: uuid().defaultRandom().unique().notNull(),
    name: varchar({ length: 256 }).notNull().unique(),
    description: varchar({ length: 4096 }),
    picturePath: text(COLUMN_PICTURE_PATH),
    pictureId: text(COLUMN_PICTURE_ID).unique(),
    createdAtUTC: timestamp(COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: timestamp(COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    status: activationStatusEnum().notNull().default(ActivationStatus.ACTIVE),
});