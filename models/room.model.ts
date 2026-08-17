import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {createRoomSchema, updateRoomSchema} from "../middlewares/zod-schemas/room.schema"
import {RoomOccupancyStatus} from "./enums/room-occupancy-status";
export interface Room{
    uuid:string,
    name:string
    description:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
    occupancyStatus:RoomOccupancyStatus
}
export interface RoomResponse extends Room{
    organizationUuid:string,
    organizationName:string,
}
export type CreateRoom= z.infer<typeof createRoomSchema> & {organizationUuid:string,organizationId:number;};
export type UpdateRoom= z.infer<typeof updateRoomSchema> & {uuid:string};