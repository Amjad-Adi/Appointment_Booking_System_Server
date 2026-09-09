import {drizzleConnection} from "../databases/drizzle-connection.js";
import {specialDaysTable} from "../drizzle-schemas/special-days.db.js";
import {organizationTable} from "../drizzle-schemas/organizations.db.js";
import {and, eq} from "drizzle-orm";
import {CreateTimeBlock, TimeBlock, TimeBlockResponse, UpdateTimeBlock} from "../models/time-block.js";
import {timeBlockTable} from "../drizzle-schemas/time-block.db.js";
import {usersTable} from "../drizzle-schemas/users.db.js";
import { alias } from "drizzle-orm/pg-core";
import {ALIAS, SECONDARY_ALIAS} from "../databases/contracts/user.contract.js";

export async function findAll(organizationUuid:string):Promise<TimeBlockResponse[]>{
    const requestUsersTable=alias(usersTable,ALIAS);
    const respondUsersTable=alias(usersTable,SECONDARY_ALIAS);
    return (await drizzleConnection
        .select({uuid:timeBlockTable.uuid,reason:timeBlockTable.reason,startAtUTC:timeBlockTable.startAtUTC,endAtUTC:timeBlockTable.endAtUTC,requestedAtUTC:timeBlockTable.requestedAtUTC,respondedAtUTC:timeBlockTable.respondedAtUTC,requestUserUuid:requestUsersTable.uuid,requestUserFirstName:requestUsersTable.firstName,requestUserLastName:requestUsersTable.lastName,requestUserProfilePicturePath:requestUsersTable.profilePicturePath,respondUserUuid:respondUsersTable.uuid,respondUserFirstName:respondUsersTable.firstName,respondUserLastName:respondUsersTable.lastName,respondUserProfilePicturePath:respondUsersTable.profilePicturePath,requestStatus:timeBlockTable.requestStatus})
        .from(timeBlockTable)
        .innerJoin(requestUsersTable,eq(requestUsersTable.id,timeBlockTable.requestUserId))
        .leftJoin(organizationTable,eq(organizationTable.id,requestUsersTable.organizationId))
        .leftJoin(respondUsersTable,eq(respondUsersTable.id,timeBlockTable.respondUserId))
        .where(eq(organizationTable.uuid,organizationUuid))
        .groupBy(timeBlockTable.requestStatus)
        .orderBy())
}

//
// export async function findAll(organizationUuid:string):Promise<TimeBlockResponse[]>{
//     const requestUsersTable=alias(usersTable,ALIAS);
//     const respondUsersTable=alias(usersTable,SECONDARY_ALIAS);
//     return (await drizzleConnection
//         .select({uuid:timeBlockTable.uuid,reason:timeBlockTable.reason,startTimeUTC:timeBlockTable.startTimeUTC,endTimeUTC:timeBlockTable.endTimeUTC,requestedAtUTC:timeBlockTable.requestedAtUTC,respondedAtUTC:timeBlockTable.respondedAtUTC,requestUserUuid:requestUsersTable.uuid,requestUserFirstName:requestUsersTable.firstName,requestUserLastName:requestUsersTable.lastName,requestUserProfilePicturePath:requestUsersTable.profilePicturePath,respondUserUuid:respondUsersTable.uuid,respondUserFirstName:respondUsersTable.firstName,respondUserLastName:respondUsersTable.lastName,respondUserProfilePicturePath:respondUsersTable.profilePicturePath,requestStatus:timeBlockTable.requestStatus})
//         .from(timeBlockTable)
//         .innerJoin(requestUsersTable,eq(requestUsersTable.id,timeBlockTable.requestUserId))
//         .leftJoin(organizationTable,eq(organizationTable.id,requestUsersTable.organizationId))
//         .leftJoin(respondUsersTable,eq(respondUsersTable.id,timeBlockTable.respondUserId))
//         .where(eq(organizationTable.uuid,organizationUuid)))
// }


export async function findByUuid(organizationUuid:string,timeBlockUuid:string):Promise<TimeBlockResponse>{
    const requestUsersTable=alias(usersTable,ALIAS);
    const respondUsersTable=alias(usersTable,SECONDARY_ALIAS);
    return (await drizzleConnection
        .select({uuid:timeBlockTable.uuid,reason:timeBlockTable.reason,startAtUTC:timeBlockTable.startAtUTC,endAtUTC:timeBlockTable.endAtUTC,requestedAtUTC:timeBlockTable.requestedAtUTC,respondedAtUTC:timeBlockTable.respondedAtUTC,requestUserUuid:requestUsersTable.uuid,requestUserFirstName:requestUsersTable.firstName,requestUserLastName:requestUsersTable.lastName,requestUserProfilePicturePath:requestUsersTable.profilePicturePath,respondUserUuid:respondUsersTable.uuid,respondUserFirstName:respondUsersTable.firstName,respondUserLastName:respondUsersTable.lastName,respondUserProfilePicturePath:respondUsersTable.profilePicturePath,requestStatus:timeBlockTable.requestStatus})
        .from(timeBlockTable)
        .innerJoin(requestUsersTable,eq(requestUsersTable.id,timeBlockTable.requestUserId))
        .leftJoin(organizationTable,eq(organizationTable.id,requestUsersTable.organizationId))
        .leftJoin(respondUsersTable,eq(respondUsersTable.id,timeBlockTable.respondUserId))
        .where(eq(organizationTable.uuid,organizationUuid)))[0]
}


export async function create(timeBlock: CreateTimeBlock):Promise<TimeBlock> {
    return (await drizzleConnection
        .insert(timeBlockTable)
        .values({reason:timeBlock.reason,startAtUTC:timeBlock.startAtUTC,endAtUTC:timeBlock.endAtUTC,requestUserId:timeBlock.requestUserId,})
        .returning({uuid:timeBlockTable.uuid,reason:timeBlockTable.reason,startAtUTC:timeBlockTable.startAtUTC,endAtUTC:timeBlockTable.endAtUTC,requestedAtUTC:timeBlockTable.requestedAtUTC,respondedAtUTC:timeBlockTable.respondedAtUTC,requestStatus:timeBlockTable.requestStatus}))[0]
}

export async function update(timeBlock: UpdateTimeBlock):Promise<TimeBlock> {
    return (await drizzleConnection
        .update(timeBlockTable)
        .set({respondUserId:timeBlock.respondUserId,respondedAtUTC:new Date(),requestStatus:timeBlock.requestStatus})
        .where(eq(timeBlockTable.uuid,timeBlock.uuid))
        .returning({uuid:timeBlockTable.uuid,reason:timeBlockTable.reason,startAtUTC:timeBlockTable.startAtUTC,endAtUTC:timeBlockTable.endAtUTC,requestedAtUTC:timeBlockTable.requestedAtUTC,respondedAtUTC:timeBlockTable.respondedAtUTC,requestStatus:timeBlockTable.requestStatus}))[0]
}