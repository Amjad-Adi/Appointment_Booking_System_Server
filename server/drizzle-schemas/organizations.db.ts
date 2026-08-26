import {drizzleConnection} from "../databases/drizzle-connection.js";
import {pgTable, bigint, primaryKey, uuid, varchar, date, timestamp,text} from "drizzle-orm/pg-core";
import {
    COLUMN_PHONE_NUMBER, COLUMN_PROFILE_PICTURE_PATH,
    COLUMN_CREATED_AT_UTC,
    COLUMN_UPDATED_AT_UTC,
    TABLE_NAME
} from "../databases/contracts/organization.contract.js";
import {activationStatusEnum} from "./enums.js";

export const organizationTable= pgTable(TABLE_NAME,{
    id:bigint({mode:"number"}).primaryKey().generatedAlwaysAsIdentity(),
    uuid:uuid().defaultRandom().unique().notNull(),
    name:varchar({length:256}).notNull(),
    email:varchar({length:320}).unique().notNull(),
    phoneNumber:varchar(COLUMN_PHONE_NUMBER,{length:20}),
    bio:varchar({length:4096}),
    locationId:bigint({mode:"number"}),
    profilePicturePath:text(COLUMN_PROFILE_PICTURE_PATH).default('PROFILE PICTURE PATH'),
    createdAtUTC:timestamp(COLUMN_CREATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    updatedAtUTC:timestamp(COLUMN_UPDATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    status:activationStatusEnum()
})