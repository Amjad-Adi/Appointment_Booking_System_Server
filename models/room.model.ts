import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {createRoomSchema, updateRoomSchema} from "../middlewares/schemas/room.schema"
import {RoomOccupancyStatus} from "./enums/room-occupancy-status";
export interface Room{
    uuid:string,
    name:string
    description:string,
    organizationId:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
    occupancyStatus:RoomOccupancyStatus
}
export interface RoomResponse{
    uuid:string,
    name:string
    description:string,
    organizationId:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
    occupancyStatus:RoomOccupancyStatus
}
export interface RoomResponse{
    uuid:string,
    name:string
    description:string,
    organizationUuid:string,
    organizationName:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
    occupancyStatus:RoomOccupancyStatus
}
export type CreateRoom= z.infer<typeof createRoomSchema> & {organizationUuid:string,organizationId:number;};
export type UpdateRoom= z.infer<typeof updateRoomSchema> & {uuid:string};