import { z } from 'zod';
import { TimeBlockStatus } from '../../models/enums/time-block-status';
import { querySchema } from './query.schema';
import { SORT_BY_END_AT_UTC, SORT_BY_REQUESTED_AT_UTC, SORT_BY_RESPONDED_AT_UTC, SORT_BY_START_AT_UTC } from '../../databases/contracts/time-block.contract';

export const createTimeBlockSchema = z.object({
    reason: z.string().trim().nonempty({ error: 'Reason is required'}).max(4096, { error: 'Reason must be at most 4096 characters'}),
    startAtUTC: z.iso.datetime({ offset: true, error: 'Start time must be a valid ISO datetime with an offset'}),
    endAtUTC: z.iso.datetime({ offset: true, error: 'End time must be a valid ISO datetime with an offset'}),
}).strict().refine((data) => new Date(data.startAtUTC).getTime() < new Date(data.endAtUTC).getTime(), {
    path: ['endAtUTC'],
    message: 'End time must be after start time'
});

export const createTimeBlockSchemaByCrm = createTimeBlockSchema.extend({
    requestUserUuid:z.uuid({ error: 'Invalid user UUID'}),
}
).strict()

export const updateTimeBlockSchema = z.object({
    requestStatus: z.enum(TimeBlockStatus, { error: 'Invalid time block status'})
}).strict();

export const timeBlockFilterSchema = z.object({
    organizationUuid: z.uuid({ error: 'Invalid organization UUID'}).optional(),
    requestStatus: z.enum(TimeBlockStatus, { error: 'Invalid time block status filter'}).optional(),
    requestUserUuid: z.uuid({ error: 'Invalid request user UUID'}).optional(),
    respondUserUuid: z.uuid({ error: 'Invalid response user UUID'}).optional(),
    fromDate: z.iso.date({ error: 'From date must be a valid date'}).optional(),
    toDate: z.iso.date({ error: 'To date must be a valid date'}).optional(),
}).strict().refine((data) => data.fromDate === undefined || data.toDate === undefined || data.fromDate <= data.toDate, {
    path: ['toDate'],
    message: 'To date must be after or equal to from date'
});

export const queryTimeBlockSchema = querySchema.extend({
    search: z.string().trim().nonempty({ error: 'Search cannot be empty'}).max(256, { error: 'Search must be at most 256 characters'}).optional(),
    filter: timeBlockFilterSchema.optional(),
    sortBy: z.enum([SORT_BY_START_AT_UTC, SORT_BY_END_AT_UTC, SORT_BY_REQUESTED_AT_UTC, SORT_BY_RESPONDED_AT_UTC], { error: 'Invalid sort field'}).optional(),
}).strict();
