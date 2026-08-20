import {
    getRooms,getRoom,updateRoom,createRoom,getNumberOfRooms
} from "../services/backend/room.service"
import { type Request, type Response } from "express";
import {CreateRoom, Room, UpdateRoom, RoomResponse, QueryRoom} from "../models/room.model";
import {findIdByUuid} from "../repositories/organizaiton.repository";
import {getOrganizationIdByUuid} from "../services/backend/organization.service";
import {} from "../utils/Request"
import {QueryService} from "../models/service.model";
import {QueryResponse} from "../models/query.model";
export async function handleGetOrganizationRooms(req:Request,res:Response) {
    const organizationUuid: string = req.params.organizationUuid as string;
    const query: QueryRoom = req.validatedQuery as unknown as QueryRoom;
    const userUuid: string = req.user.uuid as string;
    const [rooms, totalNumberOfRooms] = await Promise.all([getRooms(query, organizationUuid, userUuid), getNumberOfRooms(query, organizationUuid, userUuid)])
    query.offset = (query.page-1) * query.limit
    const baseUrl = req.originalUrl?.split("?")[0]
    const responseResult: QueryResponse = new QueryResponse(rooms, totalNumberOfRooms, baseUrl, query?.page, query?.limit)
    return res.status(200).json(responseResult)
}

export async function handleGetOrganizationRoom(req:Request,res:Response){
    const roomUuid:string=req.params.roomUuid as string;
    const userUuid:string=req.user.uuid as string;
    const organizationUuid:string=req.params.organizationUuid  as string;
    const result:RoomResponse=await getRoom(organizationUuid,roomUuid,userUuid)
    return res.status(200).json(result)
}

export async function handleCreateOrganizationRoom(req:Request,res:Response){
    const room:CreateRoom=(req.body)
    room.organizationUuid=req.params.organizationUuid as string;
    const userUuid:string=req.user.uuid as string;
    const result:Room=await createRoom(room,userUuid)
    return res.status(201).json(result)
}

export async function handleUpdateOrganizationRoom(req:Request,res:Response){
    const room:UpdateRoom=(req.body)
    room.uuid=req.params.roomUuid as string
    room.userUuid=req.user.uuid as string;
    room.organizationUuid=req.params.organizationUuid  as string;
    const result:Room=await updateRoom(room)
    return res.status(200).json(result)
}
