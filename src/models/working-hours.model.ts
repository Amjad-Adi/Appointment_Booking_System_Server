import { z } from "zod";

import {
    queryWorkingHoursSchema,
    updateWorkingHoursSchema,
} from "../middlewares/zod-schemas/working-hours.schema.js";

import { DayOfWeek } from "./enums/day-of-week.js";
import { DataResponses } from "./query.model.js";

export interface WorkingHours {
    uuid: string;
    dayOfWeek: DayOfWeek;
    startTime: string | null;
    endTime: string | null;
}

export interface WorkingHoursResponse extends WorkingHours, DataResponses {
    organizationUuid: string;
    organizationName: string;
}
export type CreateWorkingHours = {
    dayOfWeek: DayOfWeek;
    organizationId: number;
};
export type UpdateWorkingHours = z.infer<typeof updateWorkingHoursSchema> & { uuid: string; organizationUuid: string; userUuid: string; };
export type QueryWorkingHours = z.infer<typeof queryWorkingHoursSchema> & { offset?: number; };