import { z } from 'zod';

import { querySchema } from './query.schema';

import {
    SORT_BY_DAY_OF_WEEK,
    SORT_BY_START_TIME,
    SORT_BY_END_TIME,
} from '../../databases/contracts/working-hours.contract';

import { DayOfWeek } from '../../models/enums/day-of-week';

function parseTimeToMinutes(value: string): number | null {
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());

    if (!match) {
        return null;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours > 23 || minutes > 59) {
        return null;
    }

    return hours * 60 + minutes;
}

function isEndAfterStart(startTime: string, endTime: string): boolean {
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (startMinutes === null || endMinutes === null) {
        return true;
    }

    return endMinutes > startMinutes;
}

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
    if (startIsSet && endIsSet && !isEndAfterStart(startTime, endTime)) {
        ctx.addIssue({
            code: 'custom',
            path: ['endTime'],
            message: 'End time must be after start time',
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