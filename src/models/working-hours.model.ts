import type { DayOfWeek } from "./enums/day-of-week";
import { queryWorkingHoursSchema,updateDayWorkingHoursSchema,updateWorkingHoursSchema } from '../middlewares/zod-schemas/working-hours.schema';
import { z } from 'zod';
import { DataResponses } from './query.model';

export interface WorkingHours {
    uuid: string;
    dayOfWeek: DayOfWeek;
    startTime: string | null;
    endTime: string | null;
}

export interface WorkingHoursResponse extends WorkingHours,DataResponses {
    organizationUuid: string;
    organizationName: string;
}

export type CreateWorkingHours = {
    dayOfWeek: DayOfWeek;
    organizationId: number;
};
export type UpdateDayWorkingHours = z.infer<typeof updateDayWorkingHoursSchema> & {uuid: string,organizationUuid: string,organizationId:number, userUuid: string; };
export type UpdateWorkingHours = z.infer<typeof updateWorkingHoursSchema> & { uuid: string; organizationUuid: string,organizationId:number, userUuid: string; };
export type QueryWorkingHours = z.infer<typeof queryWorkingHoursSchema> & { offset?: number; };