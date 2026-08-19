import {Role} from "../../models/enums/roles";
import {ActivationStatus} from "../../models/enums/activation-status";
import {QUERY_CREATED_AT_UTC, QUERY_NAME, QUERY_UPDATED_AT_UTC} from "../../databases/contracts/user.contract";
import {z} from "zod";
import {Order} from "../../models/enums/order";
import {DEFAULT_LIMIT, DEFAULT_PAGE} from "../../models/query.model";
export const querySchema=z.object({
    order:z.enum(Order).optional(),
    page:z.coerce.number().int().positive().optional().default(DEFAULT_PAGE),
    limit:z.coerce.number().int().positive().max(100).optional().default(DEFAULT_LIMIT),
}).strict()