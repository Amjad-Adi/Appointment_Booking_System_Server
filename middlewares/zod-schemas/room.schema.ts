import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
import {RoomOccupancyStatus} from "../../models/enums/room-occupancy-status";
import {querySchema} from "./query.schema";
import {
    SORT_BY_NAME, QUERY_CREATED_AT_UTC, SORT_BY_CREATED_AT_UTC
} from "../../databases/contracts/room.contract";
export const createRoomSchema=z.object({
    name:z.string().trim().nonempty().max(256),
    description:z.string().trim().nonempty().max(4096).optional(),
}).strict()


export const updateRoomSchema=z.object({
    name:z.string().trim().nonempty().max(256).optional(),
    description:z.string().trim().nonempty().max(4096).optional(),
    assignedUserUuid:z.uuid(),
    status:z.enum(ActivationStatus).optional(),
    occupancyStatus:z.enum(RoomOccupancyStatus).optional(),
}).strict()


export const roomFilterSchema = z.object({
    status:z.enum(ActivationStatus).optional(),
    occupancyStatus:z.enum(RoomOccupancyStatus).optional(),
}).strict();

export const queryRoomSchema = querySchema.extend({
    search: z.string().trim().nonempty().max(256).optional(),
    filter: roomFilterSchema.optional(),
    sortBy: z.enum([SORT_BY_NAME, SORT_BY_CREATED_AT_UTC,]).optional(),
}).strict();