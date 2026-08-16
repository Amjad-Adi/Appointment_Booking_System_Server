import {
    getRooms,getRoom,updateRoom,createRoom
} from "../services/backend/room.service"
import { type Request, type Response } from "express";
import {CreateRoom, Room, UpdateRoom, RoomResponse} from "../models/room.model";
import {findIdByUuid} from "../repositories/organizaiton.repository";
import {getIdByUuid} from "../services/backend/organization.service";
export async function handleGetOrganizationRooms(req:Request,res:Response){
    let organizationUuid:string=req.params.organizationUuid  as string;
    const result:RoomResponse[]=await getRooms(organizationUuid)
    return res.status(200).json(result)
}

export async function handleGetOrganizationRoom(req:Request,res:Response){
    let roomUuid:string=req.params.roomUuid as string;
    let organizationUuid:string=req.params.organizationUuid  as string;
    const result:RoomResponse=await getRoom(organizationUuid,roomUuid)
    return res.status(200).json(result)
}

export async function handleCreateOrganizationRoom(req:Request,res:Response){
    let room:CreateRoom=(req.body)
    room.organizationUuid=req.params.organizationUuid as string;
    const result:Room=await createRoom(room)
    return res.status(201).json(result)
}

export async function handleUpdateOrganizationRoom(req:Request,res:Response){
    let room:UpdateRoom=(req.body)
    room.uuid=req.params.roomUuid as string
    const result:Room=await updateRoom(room)
    return res.status(200).json(result)
}
