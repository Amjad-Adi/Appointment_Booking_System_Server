import {z} from "zod";

export const createServiceJunctionCategorySchema = z.object({
    serviceUuid: z.uuid({error: "Invalid service UUID"}),
    serviceCategoryUuids: z.array(z.uuid({error: "Invalid service category UUID"})).min(1, {error: "At least one service category is required"})
    .refine((uuids) => new Set(uuids).size === uuids.length, {error: "Service category UUIDs must be unique"}),
}).strict();

export const updateServiceJunctionCategorySchema = z.object({
    serviceUuid: z.uuid({error: "Invalid service UUID"}),
    serviceCategoryUuids: z.array(z.uuid({error: "Invalid service category UUID"})).min(1, {error: "At least one service category is required"})
        .refine((uuids) => new Set(uuids).size === uuids.length, {error: "Service category UUIDs must be unique"}),
}).strict();