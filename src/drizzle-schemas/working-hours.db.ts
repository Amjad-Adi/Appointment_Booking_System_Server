import {
    bigint,
    pgTable,
    time,
    unique,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import {TABLE_NAME,COLUMN_DAY_OF_WEEK, COLUMN_ID, COLUMN_UUID,COLUMN_ORGANIZATION_ID,COLUMN_START_TIME,COLUMN_END_TIME} from "../databases/contracts/working-hours.contract.js";
import {organizationTable} from "./organizations.db";
import { DayOfWeek } from "../models/enums/day-of-week.js";

export const workingHoursTable = pgTable(TABLE_NAME, {
    id: bigint(COLUMN_ID, { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    uuid: uuid(COLUMN_UUID).defaultRandom().unique().notNull(),
    organizationId: bigint(COLUMN_ORGANIZATION_ID, { mode: 'number' }).notNull().references(() => organizationTable.id, {onDelete: 'cascade', onUpdate: 'cascade',}),
    dayOfWeek: varchar(COLUMN_DAY_OF_WEEK,{length:10}).$type<DayOfWeek>().notNull(),
    startTime: time(COLUMN_START_TIME, {withTimezone: false,}),
    endTime: time(COLUMN_END_TIME, {withTimezone: false,}),
},(table) => [
    unique("working_hours_org_day_unique").on(table.organizationId, table.dayOfWeek),
]);