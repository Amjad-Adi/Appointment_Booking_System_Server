import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {updateWorkingHoursSchema} from "../middlewares/zod-schemas/working-hours.schema";
import {DayOfWeek} from "./enums/day-of-week";
export interface WorkingHours {
    uuid:string,
    dayOfWeek:DayOfWeek,
    startTime:string|null,
    endTime:string|null,
}

export type CreateWorkingHours = {dayOfWeek:DayOfWeek,organizationId:number};
export type UpdateWorkingHours= z.infer<typeof updateWorkingHoursSchema> & {uuid:string};