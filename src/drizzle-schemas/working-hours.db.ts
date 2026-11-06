import { bigint, pgTable, time, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { organizationTable } from "./organizations.db";
import { DayOfWeek } from "../models/enums/day-of-week";
import {
    COLUMN_DAY_OF_WEEK,
    COLUMN_END_TIME,
    COLUMN_ORGANIZATION_ID,
    COLUMN_START_TIME,
    TABLE_NAME,
} from '../databases/contracts/working-hours.contract';

export const workingHoursTable = pgTable(TABLE_NAME, {
    id: bigint( { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    uuid: uuid().defaultRandom().unique().notNull(),
    organizationId: bigint(COLUMN_ORGANIZATION_ID, { mode: "number" }).notNull().references(() => organizationTable.id, { onUpdate: "cascade", onDelete: "cascade" }),
    dayOfWeek: varchar(COLUMN_DAY_OF_WEEK, { length: 10 }).$type<DayOfWeek>().notNull(),
    startTime: time(COLUMN_START_TIME, { withTimezone: false }),
    endTime: time(COLUMN_END_TIME, { withTimezone: false }),
}, (table) => [
    unique("working_hours_organization_id_day_of_week_key").on(table.organizationId, table.dayOfWeek),
]);