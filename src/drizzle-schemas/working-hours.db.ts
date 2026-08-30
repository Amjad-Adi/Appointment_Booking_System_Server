import {drizzleConnection} from "../databases/drizzle-connection.js";
import {pgTable, bigint, primaryKey, uuid, varchar, date, timestamp, time, unique} from "drizzle-orm/pg-core";
import {COLUMN_ORGANIZATION_ID} from "../databases/contracts/room.contract.js";
import {organizationTable} from "./organizations.db.js";
import {TABLE_NAME,COLUMN_DAY_OF_WEEK, COLUMN_END_TIME_UTC, COLUMN_START_TIME_UTC} from "../databases/contracts/working-hours.contract.js";
import {dayOfWeekEnum} from "./enums.js";

export const workingHoursTable= pgTable(TABLE_NAME,{
    id:bigint({mode:"number"}).primaryKey().generatedAlwaysAsIdentity(),
    uuid:uuid().defaultRandom().unique().notNull(),
    organizationId:bigint(COLUMN_ORGANIZATION_ID,{mode:"number"}).notNull().references(()=>organizationTable.id),
    dayOfWeek:dayOfWeekEnum(COLUMN_DAY_OF_WEEK).notNull(),
    startTimeUTC:time(COLUMN_START_TIME_UTC,{withTimezone:true}),
    endTimeUTC:time(COLUMN_END_TIME_UTC,{withTimezone:true}),
},(table)=>([unique("unique_days_for_organizaiton").on(table.organizationId,table.dayOfWeek)]))