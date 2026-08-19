import {bigint, date, geometry, pgTable, uuid, varchar,timestamp} from "drizzle-orm/pg-core";
import {
    COLUMN_LOCATION_ON_MAP,
    COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC,
    TABLE_NAME,
} from "../contracts/location.contract";

export const locationTable= pgTable(TABLE_NAME,{
    id:bigint({mode:"number"}).primaryKey().generatedAlwaysAsIdentity(),
    name:varchar({length:256}).notNull(),
    createdAtUTC:timestamp(COLUMN_CREATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    updatedAtUTC:timestamp(COLUMN_UPDATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    locationOnMaP:geometry(COLUMN_LOCATION_ON_MAP,{type:"point",srid:4326}).notNull(),
})