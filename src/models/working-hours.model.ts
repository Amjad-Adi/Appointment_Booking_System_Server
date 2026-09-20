import type { DayOfWeek } from "./enums/day-of-week.js";
import { queryWorkingHoursSchema, updateWorkingHoursSchema } from '../middlewares/zod-schemas/working-hours.schema';
import { z } from 'zod';

export interface UpdateWorkingHoursDay {
    dayOfWeek: DayOfWeek;
    startTime: string | null;
    endTime: string | null;
}

export interface UpdateOrganizationWorkingHours {
    organizationUuid: string;
    userUuid: string;
    days: UpdateWorkingHoursDay[];
}

export interface WorkingHours {
    uuid: string;
    dayOfWeek: DayOfWeek;
    startTime: string | null;
    endTime: string | null;
}

export interface WorkingHoursResponse extends WorkingHours {
    organizationUuid: string;
    organizationName: string;

}
export type CreateWorkingHours = {
    dayOfWeek: DayOfWeek;
    organizationId: number;
};
export type UpdateWorkingHours = z.infer<typeof updateWorkingHoursSchema> & { uuid: string; organizationUuid: string; userUuid: string; };
export type QueryWorkingHours = z.infer<typeof queryWorkingHoursSchema> & { offset?: number; };