import {drizzleConnection} from "../drizzle-connection";
import {pgTable, bigint, primaryKey, uuid, varchar, date, timestamp, text} from "drizzle-orm/pg-core";
import {
    COLUMN_CREATED_AT_UTC,
    COLUMN_DAY_DATE, COLUMN_NAME,
    COLUMN_UPDATED_AT_UTC,
    TABLE_NAME
} from "../contracts/special-days.contract";
import {activationStatusEnum, roleEnum} from "./enums";
import {COLUMN_ORGANIZATION_ID} from "../contracts/room.contract";
import {organizationTable} from "./organizations.db";
import {COLUMN_FIRST_NAME, COLUMN_LAST_NAME, COLUMN_UID} from "../contracts/user.contract";
import {COLUMN_PROFILE_PICTURE_PATH} from "../contracts/organization.contract";
import {ActivationStatus} from "../../models/enums/activation-status";

export const usersTable= pgTable(TABLE_NAME,{
    id:bigint({mode:"number"}).primaryKey().generatedAlwaysAsIdentity(),
    uuid:uuid().defaultRandom().unique().notNull(),
    firstName:varchar(COLUMN_FIRST_NAME,{length:64}).notNull(),
    lastName:varchar(COLUMN_LAST_NAME,{length:64}).notNull(),
    email:varchar({length:320}).notNull().unique(),
    firebaseUid:varchar(COLUMN_UID,{length:128}).notNull(),
    profilePicturePath:text(COLUMN_PROFILE_PICTURE_PATH).default('PROFILE PICTURE PATH'),
    createdAtUTC:timestamp(COLUMN_CREATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    updatedAtUTC:timestamp(COLUMN_UPDATED_AT_UTC,{withTimezone:true}).notNull().defaultNow(),
    organizationId:bigint(COLUMN_ORGANIZATION_ID,{mode:"number"}).notNull().references(()=>organizationTable.id),
    language:date(COLUMN_DAY_DATE).notNull().default("en"),
    role:roleEnum().notNull(),
    status:activationStatusEnum().default(ActivationStatus.ACTIVE).notNull(),
})