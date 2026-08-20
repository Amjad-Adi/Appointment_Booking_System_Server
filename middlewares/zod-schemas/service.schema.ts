import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
import {querySchema} from "./query.schema";
import {
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_NAME,
    SORT_BY_PRICE,
    SORT_BY_DURATION_IN_MINUTES
} from "../../databases/contracts/service.contract";
export const createServiceSchema=z.object({
    name:z.string().trim().nonempty().max(256),
    description:z.string().trim().nonempty().max(4096).optional(),
    price:z.number(),
    durationInMinutes:z.number().int().positive(),
    profilePicturePath:z.string().trim().nonempty().optional()
}).strict()


export const updateServiceSchema=createServiceSchema.partial().extend({
    status:z.enum(ActivationStatus).optional()
}).strict()


export const serviceFilterSchema = z.object({
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    maxDurationInMinutes:z.coerce.number().positive().optional(),
    status:z.enum(ActivationStatus).optional(),
}).strict();

export const queryServiceSchema = querySchema.extend({
    search: z.string().trim().nonempty().max(256).optional(),
    filter: serviceFilterSchema.optional(),
    sortBy: z.enum([SORT_BY_NAME, SORT_BY_PRICE,SORT_BY_DURATION_IN_MINUTES, SORT_BY_CREATED_AT_UTC]).optional(),
}).strict();