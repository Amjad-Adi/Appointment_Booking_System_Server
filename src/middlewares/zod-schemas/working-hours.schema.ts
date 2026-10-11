import { z } from 'zod';

import { querySchema } from './query.schema';

import {
    SORT_BY_DAY_OF_WEEK,
    SORT_BY_START_TIME,
    SORT_BY_END_TIME,
} from '../../databases/contracts/working-hours.contract';

import { DayOfWeek } from '../../models/enums/day-of-week';

export const updateDayWorkingHoursSchema = z.object({
    startTime: z.iso.time({ precision: -1, error: 'Start time must be a valid time'}).nullable(),
    endTime: z.iso.time({ precision: -1, error: 'End time must be a valid time'}).nullable(),
}).strict().superRefine((data, ctx) => {
    const { startTime, endTime } = data;
    const startIsSet = startTime !== null;
    const endIsSet = endTime !== null;
    if (startIsSet !== endIsSet) {
        if (!startIsSet) {
            ctx.addIssue({
                code: 'custom',
                path: ['startTime'],
                message:
                    'Start time is required when end time is set',
            });
        }
        if (!endIsSet) {
            ctx.addIssue({
                code: 'custom',
                path: ['endTime'],
                message:
                    'End time is required when start time is set',
            });
        }
        return;
    }
    if (startIsSet && endIsSet && startTime >= endTime) {
        ctx.addIssue({
            code: 'custom',
            path: ['endTime'],
            message: 'End time must be after start time',
        });
    }
});

const updateWorkingHours = updateDayWorkingHoursSchema.extend({
    dayOfWeek: z.enum(DayOfWeek, { error: 'Day of week is required'})
}).strict()


export const updateWorkingHoursSchema = z.object({
    days: z.array(updateWorkingHours).min(1, { error: 'At least one working-hours day is required'}).max(7, { error: 'A maximum of 7 working-hours days can be updated'})
}).strict().superRefine((data, ctx) => {
    const uniqueDays = new Set(data.days.map(day => day.dayOfWeek));
    if (uniqueDays.size !== data.days.length) {
        ctx.addIssue({
            code: 'custom',
            path: ['days'],
            message:
                'Each day of the week can only be included once',
        });
    }
});

export const workingHoursFilterSchema = z.object({
    organizationUuid: z.uuid({ error: 'Invalid organization UUID'}).optional(),
    dayOfWeek: z.enum(DayOfWeek, { error: 'Invalid day of week filter'}).optional(),
}).strict();

export const queryWorkingHoursSchema = querySchema.extend({
        search: z.string().trim().nonempty({ error: 'Search cannot be empty'}).max(256, { error: 'Search must be at most 256 characters'}).optional(),
        filter: workingHoursFilterSchema.optional(),
        sortBy: z.enum([SORT_BY_DAY_OF_WEEK, SORT_BY_START_TIME, SORT_BY_END_TIME], { error: 'Invalid sort field'}).optional(),
}).strict();