import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
import {RoomOccupancyStatus} from "../../models/enums/room-occupancy-status";
export const createRoomSchema=z.object({
    name:z.string().trim().nonempty().max(256),
    description:z.string().trim().max(4096).nonempty().optional(),
}).strict()


export const updateRoomSchema=z.object({
    name:z.string().trim().nonempty().max(256).optional(),
    description:z.string().trim().max(4096).nonempty().optional(),
    status:z.enum(ActivationStatus).optional(),
    occupancyStatus:z.enum(RoomOccupancyStatus).optional(),
}).strict()