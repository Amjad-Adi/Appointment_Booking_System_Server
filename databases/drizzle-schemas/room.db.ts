import {drizzleConnection} from "../drizzle-connection";
import {pgTable, bigint, primaryKey, uuid, varchar, date, timestamp} from "drizzle-orm/pg-core";
import {
    COLUMN_CREATED_AT_UTC,
    COLUMN_DAY_DATE, COLUMN_NAME,
    COLUMN_UPDATED_AT_UTC,
    TABLE_NAME
} from "../contracts/special-days.contract";
import {activationStatusEnum, occupancyStatusEnum} from "./enums";
import {COLUMN_ORGANIZATION_ID} from "../contracts/room.contract";
import {organizationTable} from "./organizations.db";
import {ActivationStatus} from "../../models/enums/activation-status";
import {RoomOccupancyStatus} from "../../models/enums/room-occupancy-status";

export const roomTable= pgTable(TABLE_NAME,{
    id:bigint({mode:"number"}).primaryKey().generatedAlwaysAsIdentity(),
    uuid:uuid().defaultRandom().unique().notNull(),
    name:varchar({length:256}).notNull(),
    description:varchar({length:4096}),
    organizationId:bigint(COLUMN_ORGANIZATION_ID,{mode:"number"}).notNull().references(()=>organizationTable.id),
    dayDate:date(COLUMN_DAY_DATE).notNull(),
    createdAtUTC:timestamp(COLUMN_CREATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    updatedAtUTC:timestamp(COLUMN_UPDATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    status:activationStatusEnum().default(ActivationStatus.ACTIVE).notNull(),
    occupancyStatus:occupancyStatusEnum().default(RoomOccupancyStatus.AVAILABLE).notNull(),
})