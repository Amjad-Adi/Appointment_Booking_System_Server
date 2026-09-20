import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status.js"
import {RoomOccupancyStatus} from "../../models/enums/room-occupancy-status.js";
import {querySchema} from "./query.schema.js";
import {
    SORT_BY_NAME, SORT_BY_CREATED_AT_UTC
} from "../../databases/contracts/room.contract.js";
export const createRoomSchema=z.object({
    name:z.string().trim().nonempty().max(256),
    description: z
        .string()
        .trim()
        .max(4096, 'Description must not exceed 4096 characters')
        .transform((value) => (value === '' ? null : value))
        .nullable()
        .optional(),
}).strict()


export const updateRoomSchema=z.object({
    name:z.string().trim().nonempty().max(256).optional(),
    description: z
        .string()
        .trim()
        .max(4096, 'Description must not exceed 4096 characters')
        .transform((value) => (value === '' ? null : value))
        .nullable()
        .optional(),
    assignedUserUuid: z.uuid().nullable().optional(),
    status:z.enum(ActivationStatus).optional(),
    occupancyStatus:z.enum(RoomOccupancyStatus).optional(),
}).strict()


export const roomFilterSchema = z.object({
    organizationUuid: z.uuid('Invalid organization UUID').optional(),
    status:z.enum(ActivationStatus).optional(),
    occupancyStatus:z.enum(RoomOccupancyStatus).optional(),
}).strict();

export const queryRoomSchema = querySchema.extend({
    search: z.string().trim().nonempty().max(256).optional(),
    filter: roomFilterSchema.optional(),
    sortBy: z.enum([SORT_BY_NAME, SORT_BY_CREATED_AT_UTC,]).optional(),
}).strict();