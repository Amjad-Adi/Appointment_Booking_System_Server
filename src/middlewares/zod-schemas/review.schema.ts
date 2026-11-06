import { z } from 'zod';

import { querySchema } from './query.schema';

import {
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_RATING,
    SORT_BY_UPDATED_AT_UTC,
} from '../../databases/contracts/review.contract';

export const createReviewSchema = z.object({
    appointmentUuid: z.uuid({ error: 'Invalid appointment UUID' }),
    rating: z.coerce.number({ error: 'Rating must be a number' }).min(1, { error: 'Rating must be at least 1' }).max(5, { error: 'Rating must be at most 5' }),
    comment: z.string().trim().nonempty({ error: 'Comment is required' }).max(4096, { error: 'Comment must be at most 4096 characters' }),
}).strict();

export const updateReviewSchema = z.object({
    rating: z.coerce.number({ error: 'Rating must be a number' }).min(1, { error: 'Rating must be at least 1' }).max(5, { error: 'Rating must be at most 5' }).optional(),
    comment: z.string().trim().nonempty({ error: 'Comment cannot be empty' }).max(4096, { error: 'Comment must be at most 4096 characters' }).optional(),
}).strict().refine((data) => Object.keys(data).length !== 0, { message: 'At least one field must be provided' });

export const reviewFilterSchema = z.object({
    serviceUuid: z.uuid({ error: 'Invalid service UUID' }).optional(),
    organizationUuid: z.uuid({ error: 'Invalid organization UUID' }).optional(),
    appointmentUuid: z.uuid({ error: 'Invalid appointment UUID' }).optional(),
    rating: z.coerce.number({ error: 'Rating must be a number' }).int({ error: 'Rating must be an integer' }).min(1, { error: 'Rating must be at least 1' }).max(5, { error: 'Rating must be at most 5' }).optional(),
}).strict();

export const queryReviewSchema = querySchema.extend({
    search: z.string().trim().max(320, { error: 'Search must be at most 320 characters' }).optional(),
    filter: reviewFilterSchema.optional(),
    sortBy: z.enum([SORT_BY_CREATED_AT_UTC, SORT_BY_UPDATED_AT_UTC, SORT_BY_RATING], { error: 'Invalid sort field' }).optional(),
}).strict();
