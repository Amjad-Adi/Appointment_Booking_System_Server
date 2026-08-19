import {
    getRooms,getRoom,updateRoom,createRoom
} from "../services/backend/room.service"
import { type Request, type Response } from "express";
import {CreateRoom, Room, UpdateRoom, RoomResponse} from "../models/room.model";
import {findIdByUuid} from "../repositories/organizaiton.repository";
import {getOrganizationIdByUuid} from "../services/backend/organization.service";
import {} from "../utils/Request"
export async function handleGetOrganizationRooms(req:Request,res:Response){
    let organizationUuid:string=req.params.organizationUuid  as string;
    let userUuid:string=req.user.uuid as string;
    const result:RoomResponse[]=await getRooms(organizationUuid,userUuid)
    return res.status(200).json(result)
}

export async function handleGetOrganizationRoom(req:Request,res:Response){
    let roomUuid:string=req.params.roomUuid as string;
    let userUuid:string=req.user.uuid as string;
    let organizationUuid:string=req.params.organizationUuid  as string;
    const result:RoomResponse=await getRoom(organizationUuid,roomUuid,userUuid)
    return res.status(200).json(result)
}

export async function handleCreateOrganizationRoom(req:Request,res:Response){
    let room:CreateRoom=(req.body)
    room.organizationUuid=req.params.organizationUuid as string;
    let userUuid:string=req.user.uuid as string;
    const result:Room=await createRoom(room,userUuid)
    return res.status(201).json(result)
}

export async function handleUpdateOrganizationRoom(req:Request,res:Response){
    let room:UpdateRoom=(req.body)
    room.uuid=req.params.roomUuid as string
    room.userUuid=req.user.uuid as string;
    room.organizationUuid=req.params.organizationUuid  as string;
    const result:Room=await updateRoom(room)
    return res.status(200).json(result)
}
