import { z } from 'zod';
import { ActivationStatus } from '../../models/enums/activation-status';
import { querySchema } from './query.schema';
import { SORT_BY_CREATED_AT_UTC, SORT_BY_UPDATED_AT_UTC } from '../../databases/contracts/room.contract';
import { SORT_BY_DAY_DATE, SORT_BY_NAME } from '../../databases/contracts/special-days.contract';

export const createSpecialDaySchema = z.object({
    name: z.string().trim().nonempty({ error: 'Special Day Name is required'}).max(256, { error: 'Special Day Name must be at most 256 characters'}),
    dayDate: z.iso.date({ error: 'Invalid date'}),
    description: z.string().trim().nonempty({ error: 'Description cannot be empty'}).max(4096, { error: 'Description must be at most 4096 characters'}).optional(),
}).strict();

export const updateSpecialDaySchema = z.object({
    name: z.string().trim().nonempty({ error: 'Special Day Name is required'}).max(256, { error: 'Special Day Name must be at most 256 characters'}).optional(),
    dayDate: z.iso.date({ error: 'Invalid date'}).optional(),
    description: z.string().trim().nonempty({ error: 'Description cannot be empty'}).max(4096, { error: 'Description must be at most 4096 characters'}).optional(),
    status: z.enum(ActivationStatus, { error: 'Invalid activation status'}).optional(),
}).strict();

export const specialDayFilterSchema = z.object({
    organizationUuid: z.uuid({ error: 'Invalid organization UUID'}).optional(),
    status: z.enum(ActivationStatus, { error: 'Invalid activation status filter'}).optional(),
    fromDate: z.iso.date({ error: 'Invalid from date'}).optional(),
    toDate: z.iso.date({ error: 'Invalid to date'}).optional(),
}).strict().superRefine((data, ctx) => {
    if (data.fromDate !== undefined && data.toDate !== undefined && data.fromDate > data.toDate) {
        ctx.addIssue({ code: "custom", path: ["toDate"], message: "To date must be after or equal to from date"});
    }
});

export const querySpecialDaySchema = querySchema.extend({
    search: z.string().trim().max(256, { error: 'Search must be at most 256 characters'}).optional(),
    filter: specialDayFilterSchema.optional(),
    sortBy: z.enum([SORT_BY_NAME, SORT_BY_DAY_DATE, SORT_BY_CREATED_AT_UTC, SORT_BY_UPDATED_AT_UTC], { error: "Invalid sort field"}).optional(),
}).strict();