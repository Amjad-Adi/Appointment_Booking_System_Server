import {drizzleConnection} from "../databases/drizzle-connection";
import {specialDaysTable} from "../databases/drizzle-schemas/special-days.db";
import {organizationTable} from "../databases/drizzle-schemas/organizations.db";
import {and, eq} from "drizzle-orm";
import {CreateSpecialDay, SpecialDay, UpdateSpecialDay} from "../models/special-days.model";

export async function findAll(organizationUuid:string):Promise<SpecialDay[]>{
    return await drizzleConnection
        .select({uuid:specialDaysTable.uuid,name:specialDaysTable.name,dayDate:specialDaysTable.dayDate,description:specialDaysTable.description,createdAtUTC:specialDaysTable.createdAtUTC,updatedAtUTC:specialDaysTable.updatedAtUTC,status:specialDaysTable.status})
        .from(specialDaysTable)
        .innerJoin(organizationTable,eq(specialDaysTable.organizationId,organizationTable.id))
        .where(eq(organizationTable.uuid,organizationUuid))
}

export async function findByUuid(organizationUuid:string,specialDayUuid:string):Promise<SpecialDay>{
    return (await drizzleConnection
        .select({uuid:specialDaysTable.uuid,name:specialDaysTable.name,dayDate:specialDaysTable.dayDate,description:specialDaysTable.description,createdAtUTC:specialDaysTable.createdAtUTC,updatedAtUTC:specialDaysTable.updatedAtUTC,status:specialDaysTable.status})
        .from(specialDaysTable)
        .innerJoin(organizationTable,eq(specialDaysTable.organizationId,organizationTable.id))
        .where(and(eq(organizationTable.uuid,organizationUuid),eq(specialDaysTable.uuid,specialDayUuid))))[0]
}


export async function create(specialDay: CreateSpecialDay):Promise<SpecialDay> {
    return (await drizzleConnection
        .insert(specialDaysTable)
        .values({name:specialDay.name,dayDate:specialDay.dayDate,organizationId:specialDay.organizationId,description:specialDay.description}).
        returning({uuid:specialDaysTable.uuid,name:specialDaysTable.name,dayDate:specialDaysTable.dayDate,description:specialDaysTable.description,createdAtUTC:specialDaysTable.createdAtUTC,updatedAtUTC:specialDaysTable.updatedAtUTC,status:specialDaysTable.status}))[0]
}

export async function update(specialDay: UpdateSpecialDay):Promise<SpecialDay> {
    return (await drizzleConnection
        .update(specialDaysTable)
        .set({name:specialDay.name,dayDate:specialDay.dayDate,description:specialDay.description,status:specialDay.status})
        .where(eq(specialDaysTable.uuid,specialDay.uuid))
        .returning({uuid:specialDaysTable.uuid,name:specialDaysTable.name,dayDate:specialDaysTable.dayDate,description:specialDaysTable.description,createdAtUTC:specialDaysTable.createdAtUTC,updatedAtUTC:specialDaysTable.updatedAtUTC,status:specialDaysTable.status}))[0]
}

export async function isTodaySpecialDay(organizationUuid:string,date:string){
    return (await drizzleConnection
        .select({uuid:specialDaysTable.uuid,name:specialDaysTable.name,dayDate:specialDaysTable.dayDate,description:specialDaysTable.description,createdAtUTC:specialDaysTable.createdAtUTC,updatedAtUTC:specialDaysTable.updatedAtUTC,status:specialDaysTable.status})
        .from(specialDaysTable)
        .innerJoin(organizationTable,eq(specialDaysTable.organizationId,organizationTable.id))
        .where(and(eq(organizationTable.uuid,organizationUuid),eq(specialDaysTable.dayDate,date))))[0]
}