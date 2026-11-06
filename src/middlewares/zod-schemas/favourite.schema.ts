import { z } from 'zod';

import { querySchema } from './query.schema';

import {
    SORT_BY_FAVOURITED_AT_UTC,
    SORT_BY_NAME,
    SORT_BY_PRICE,
} from '../../databases/contracts/favourite.contract';

export const createFavouriteSchema = z.object({
    serviceUuid: z.uuid({ error: 'Invalid service UUID' }),
}).strict();

export const favouriteFilterSchema = z.object({
    serviceCategoryUuid: z.uuid({ error: 'Invalid service category UUID' }).optional(),
}).strict();

export const queryFavouriteSchema = querySchema.extend({
    search: z.string().trim().max(256, { error: 'Search must be at most 256 characters' }).optional(),
    filter: favouriteFilterSchema.optional(),
    sortBy: z.enum([SORT_BY_NAME, SORT_BY_PRICE, SORT_BY_FAVOURITED_AT_UTC], { error: 'Invalid sort field' }).optional(),
}).strict();
