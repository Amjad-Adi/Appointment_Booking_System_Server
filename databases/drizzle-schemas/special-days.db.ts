import {drizzleConnection} from "../drizzle-connection";
import {pgTable, bigint, primaryKey, uuid, varchar, date, timestamp} from "drizzle-orm/pg-core";
import {
    COLUMN_CREATED_AT_UTC,
    COLUMN_DAY_DATE,
    COLUMN_UPDATED_AT_UTC,COLUMN_ORGANIZATION_ID,
    TABLE_NAME
} from "../contracts/special-days.contract";
import {activationStatusEnum} from "./enums";
import {organizationTable} from "./organizations.db";
import {ActivationStatus} from "../../models/enums/activation-status";

export const specialDaysTable= pgTable(TABLE_NAME,{
    id:bigint({mode:"number"}).primaryKey().generatedAlwaysAsIdentity(),
    uuid:uuid().defaultRandom().unique().notNull(),
    name:varchar({length:256}).notNull(),
    organizationId:bigint(COLUMN_ORGANIZATION_ID,{mode:"number"}).notNull().references(()=>organizationTable.id),
    dayDate:date(COLUMN_DAY_DATE).notNull(),
    description:varchar({length:4096}),
    createdAtUTC:timestamp(COLUMN_CREATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    updatedAtUTC:timestamp(COLUMN_UPDATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    status:activationStatusEnum().default(ActivationStatus.ACTIVE).notNull(),
})