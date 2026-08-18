import {drizzleConnection} from "../drizzle-connection";
import {pgTable, bigint, primaryKey, uuid, varchar, date, timestamp, real, integer, text} from "drizzle-orm/pg-core";
import {
    COLUMN_PICTURE_PATH,COLUMN_DURATION_IN_MINUTES,
    COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC,COLUMN_ORGANIZATION_ID,
    TABLE_NAME
} from "../contracts/service.contract";
import {activationStatusEnum} from "./enums";
import {organizationTable} from "./organizations.db";
import {ActivationStatus} from "../../models/enums/activation-status";

export const serviceTable= pgTable(TABLE_NAME,{
    id:bigint({mode:"number"}).primaryKey().generatedAlwaysAsIdentity(),
    uuid:uuid().defaultRandom().unique().notNull(),
    name:varchar({length:256}).notNull(),
    description:varchar({length:4096}),
    price:real().notNull(),
    durationInMinutes:integer(COLUMN_DURATION_IN_MINUTES).notNull(),
    picturePath:text(COLUMN_PICTURE_PATH).default('PROFILE PICTURE PATH'),
    organizationId:bigint(COLUMN_ORGANIZATION_ID,{mode:"number"}).notNull().references(()=>organizationTable.id),
    createdAtUTC:timestamp(COLUMN_CREATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    updatedAtUTC:timestamp(COLUMN_UPDATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    status:activationStatusEnum().default(ActivationStatus.ACTIVE).notNull(),
})