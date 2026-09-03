import {Role} from "./enums/roles.js";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status.js";
import {updateWorkingHoursSchema} from "../middlewares/zod-schemas/working-hours.schema.js";
import {DayOfWeek} from "./enums/day-of-week.js";
export interface WorkingHours {
    uuid:string,
    dayOfWeek:DayOfWeek,
    startTime:string|null,
    endTime:string|null,
}

export type CreateWorkingHours = {dayOfWeek:DayOfWeek,organizationId:number};
export type UpdateWorkingHours= z.infer<typeof updateWorkingHoursSchema> & {uuid:string};