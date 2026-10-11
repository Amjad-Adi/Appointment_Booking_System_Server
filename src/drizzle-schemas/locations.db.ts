import { bigint, geometry, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import {
    COLUMN_LOCATION_ON_MAP, COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC, TABLE_NAME
} from "../databases/contracts/location.contract";

export const locationTable = pgTable(TABLE_NAME, {
    id: bigint({ mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    name: varchar({ length: 1024 }).notNull(),
    timezone: varchar({ length: 64 }).notNull(),
    locationOnMap: geometry(COLUMN_LOCATION_ON_MAP, { type: "point", srid: 4326 }),
    createdAtUTC: timestamp(COLUMN_CREATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
    updatedAtUTC: timestamp(COLUMN_UPDATED_AT_UTC, { withTimezone: true }).notNull().defaultNow(),
});