import {drizzleConnection} from "../drizzle-connection";
import {pgTable, bigint, primaryKey, uuid, varchar, date, timestamp, text, time} from "drizzle-orm/pg-core";
import {
    COLUMN_REQUESTED_AT_UTC,
    COLUMN_START_TIME_UTC, COLUMN_END_TIME_UTC,
    TABLE_NAME, COLUMN_RESPONDED_AT_UTC, COLUMN_REQUEST_STATUS
} from "../contracts/time-block.contract";
import {timeBlockStatusEnum} from "./enums";
import {usersTable} from "./users.db";
import {TimeBlockStatus} from "../../models/enums/time-block-status";

export const timeBlockTable= pgTable(TABLE_NAME,{
    id:bigint({mode:"number"}).primaryKey().generatedAlwaysAsIdentity(),
    uuid:uuid().defaultRandom().unique().notNull(),
    reason:varchar({length:4096}),
    startTimeUTC:time(COLUMN_START_TIME_UTC,{withTimezone:true}).notNull(),
    endTimeUTC:time(COLUMN_END_TIME_UTC,{withTimezone:true}).notNull(),
    requestUserId:bigint({mode:"number"}).notNull().references(()=>usersTable.id),
    respondUserId:bigint({mode:"number"}).references(()=>usersTable.id),
    requestedAtUTC:timestamp(COLUMN_REQUESTED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    respondedAtUTC:timestamp(COLUMN_RESPONDED_AT_UTC,{withTimezone:true}),
    requestStatus:timeBlockStatusEnum(COLUMN_REQUEST_STATUS).notNull().default(TimeBlockStatus.PENDING),
})