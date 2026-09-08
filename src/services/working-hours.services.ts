import {CreateWorkingHours, UpdateWorkingHours, WorkingHours} from "../models/working-hours.model.js";
import {drizzleConnection} from "../databases/drizzle-connection.js";
import {workingHoursTable} from "../drizzle-schemas/working-hours.db.js";
import {eq} from "drizzle-orm";
import {DayOfWeek} from "../models/enums/day-of-week.js";
import {createWorkingDays} from "../repositories/working-hours.repository.js";


export async function createWorkingDaysService(organizationId:number):Promise<void>{
    const workingHoursForDays:CreateWorkingHours[]= Object.values(DayOfWeek).map((day)=>({
        dayOfWeek:day,
        organizationId:organizationId
    }))//create array of CreateWorkingHours for each day (7 days) for that organization
    await createWorkingDays(workingHoursForDays)
}