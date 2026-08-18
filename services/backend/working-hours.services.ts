import {CreateWorkingHours, UpdateWorkingHours, WorkingHours} from "../../models/working-hours.model";
import {drizzleConnection} from "../../databases/drizzle-connection";
import {workingHoursTable} from "../../databases/drizzle-schemas/working-hours.db";
import {eq} from "drizzle-orm";
import {DayOfWeek} from "../../models/enums/day-of-week";
import {createWorkingDays} from "../../repositories/working-hours.repository";


export async function createWorkingDaysService(organizationId:number):Promise<void>{
    const workingHoursForDays:CreateWorkingHours[]= Object.values(DayOfWeek).map((day)=>({
        dayOfWeek:day,
        organizationId:organizationId
    }))//create array of CreateWorkingHours for each day (7 days) for that organization
    await createWorkingDays(workingHoursForDays)
}