import {drizzleConnection} from "../drizzle-connection";
import {pgTable, bigint, primaryKey, uuid, varchar, date, timestamp,text} from "drizzle-orm/pg-core";
import {
    COLUMN_CREATED_AT_UTC,
    COLUMN_DAY_DATE, COLUMN_NAME,
    COLUMN_UPDATED_AT_UTC,
    TABLE_NAME
} from "../contracts/special-days.contract";
import {activationStatusEnum} from "./enums";
import {COLUMN_ORGANIZATION_ID} from "../contracts/room.contract";
import {COLUMN_PHONE_NUMBER, COLUMN_PROFILE_PICTURE_PATH} from "../contracts/organization.contract";

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