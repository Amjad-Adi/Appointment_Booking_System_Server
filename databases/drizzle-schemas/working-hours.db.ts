import {drizzleConnection} from "../drizzle-connection";
import {pgTable, bigint, primaryKey, uuid, varchar, date, timestamp, time, unique} from "drizzle-orm/pg-core";
import {COLUMN_ORGANIZATION_ID} from "../contracts/room.contract";
import {organizationTable} from "./organizations.db";
import {TABLE_NAME,COLUMN_DAY_OF_WEEK, COLUMN_END_TIME_UTC, COLUMN_START_TIME_UTC} from "../contracts/working-hours.contract";
import {dayOfWeekEnum} from "./enums";

export const workingHoursTable= pgTable(TABLE_NAME,{
    id:bigint({mode:"number"}).primaryKey().generatedAlwaysAsIdentity(),
    uuid:uuid().defaultRandom().unique().notNull(),
    organizationId:bigint(COLUMN_ORGANIZATION_ID,{mode:"number"}).notNull().references(()=>organizationTable.id),
    dayOfWeek:dayOfWeekEnum(COLUMN_DAY_OF_WEEK).notNull(),
    startTimeUTC:time(COLUMN_START_TIME_UTC,{withTimezone:true}),
    endTimeUTC:time(COLUMN_END_TIME_UTC,{withTimezone:true}),
},(table)=>([unique("unique_days_for_organizaiton").on(table.organizationId,table.dayOfWeek)]))