import {z} from "zod";
import {Order} from "../../models/enums/order.js";
import {DEFAULT_LIMIT, DEFAULT_PAGE} from "../../models/query.model.js";
export const querySchema=z.object({
    order:z.enum(Order).optional(),
    page:z.coerce.number().int().positive().optional().default(DEFAULT_PAGE),
    limit:z.coerce.number().int().positive().max(100).optional().default(DEFAULT_LIMIT),
}).strict()