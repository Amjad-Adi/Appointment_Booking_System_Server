import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {createRoomSchema, queryRoomSchema, updateRoomSchema} from "../middlewares/zod-schemas/room.schema"
import {RoomOccupancyStatus} from "./enums/room-occupancy-status";
import {queryServiceSchema} from "../middlewares/zod-schemas/service.schema";
import {DataResponses} from "./query.model";
export interface Room{
    uuid:string,
    name:string
    description:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
    occupancyStatus:RoomOccupancyStatus
}
export interface RoomResponse extends Room,DataResponses{
    organizationUuid:string,
    organizationName:string,
    userUuid:string,
    firstName:string,
    lastName:string,
    profilePicturePath:string,
}

export type CreateRoom= z.infer<typeof createRoomSchema> & {organizationUuid:string,organizationId:number;};
export type UpdateRoom= z.infer<typeof updateRoomSchema> & {uuid:string,organizationUuid:string,userUuid:string,assignedUserId:number;};
export type QueryRoom=z.infer<typeof queryRoomSchema>&{offset:number};