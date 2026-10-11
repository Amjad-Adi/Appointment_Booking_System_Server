import { z } from 'zod';
import { Order } from '../../models/enums/order';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../models/query.model';

export const querySchema = z.object({
    order: z.enum(Order, { error: 'Invalid sort order'}).optional(),
    page: z.coerce.number({ error: 'Page must be a number'}).int({ error: 'Page must be an integer'}).positive({ error: 'Page must be greater than 0'}).optional().default(DEFAULT_PAGE),
    limit: z.coerce.number({ error: 'Limit must be a number'}).int({ error: 'Limit must be an integer'}).positive({ error: 'Limit must be greater than 0'}).max(1000, { error: 'Limit must be at most 1000'}).optional().default(DEFAULT_LIMIT),
}).strict();