import {drizzleConnection} from "../databases/drizzle-connection.js";
import {pgTable, bigint, primaryKey, uuid, varchar, date, timestamp} from "drizzle-orm/pg-core";
import {
    COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC,COLUMN_ORGANIZATION_ID,
    TABLE_NAME,COLUMN_USER_ID
} from "../databases/contracts/room.contract.js";
import {activationStatusEnum, occupancyStatusEnum} from "./enums.js";
import {organizationTable} from "./organizations.db.js";
import {ActivationStatus} from "../models/enums/activation-status.js";
import {RoomOccupancyStatus} from "../models/enums/room-occupancy-status.js";
import {usersTable} from "./users.db.js";
export const roomTable= pgTable(TABLE_NAME,{
    id:bigint({mode:"number"}).primaryKey().generatedAlwaysAsIdentity(),
    uuid:uuid().defaultRandom().unique().notNull(),
    name:varchar({length:256}).notNull(),
    description:varchar({length:4096}),
    userId:bigint(COLUMN_USER_ID,{mode:"number"}).notNull().references(()=>usersTable.id),
    organizationId:bigint(COLUMN_ORGANIZATION_ID,{mode:"number"}).notNull().references(()=>organizationTable.id),
    createdAtUTC:timestamp(COLUMN_CREATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    updatedAtUTC:timestamp(COLUMN_UPDATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    status:activationStatusEnum().default(ActivationStatus.ACTIVE).notNull(),
    occupancyStatus:occupancyStatusEnum().default(RoomOccupancyStatus.AVAILABLE).notNull(),
})