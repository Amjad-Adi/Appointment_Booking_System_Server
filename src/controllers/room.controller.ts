import {
    getRooms,
    getRoom,
    updateRoom,
    createRoom,
    getNumberOfRooms,
} from "../services/room.service.js";

import {
    type Request,
    type Response,
} from "express";

import {
    CreateRoom,
    Room,
    UpdateRoom,
    RoomResponse,
    QueryRoom,
} from "../models/room.model.js";

import { QueryResponse } from "../models/query.model.js";
import {ServiceResponse} from "../models/service.model";
import {getService} from "../services/service.service";

export async function handleGetOrganizationRooms(req: Request, res: Response){
    const routeOrganizationUuid = req.params.organizationUuid as string;
    const query = req.validatedQuery as unknown as QueryRoom;
    query.offset = (query.page - 1) * query.limit;
    const organizationUuid=req.user?.organizationUuid;
    if(organizationUuid!==null){
        query.filter = {
            ...query.filter,
            organizationUuid,
        };
    }
    const[rooms, totalNumberOfRooms] = await Promise.all([getRooms(query ), getNumberOfRooms(query),]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new QueryResponse(rooms, totalNumberOfRooms, baseUrl, query.page, query.limit)
    return res.status(200).json(responseResult);
}

export async function handleGetOrganizationRoom(req: Request, res: Response){
    const roomUuid = req.params.roomUuid as string
    const organizationUuid=req.user?.organizationUuid;
    const result: RoomResponse = await getRoom(roomUuid,organizationUuid);
    return res.status(200).json(result);
}

export async function handleCreateOrganizationRoom(req: Request, res: Response){
    const room = req.body as CreateRoom;
    room.organizationUuid = req.params.organizationUuid as string;
    const userUuid = req.user?.uuid as string;
    const result: Room = await createRoom(room, userUuid);
    return res.status(201).json(result);
}

export async function handleUpdateOrganizationRoom(req: Request, res: Response) {
    const room = req.body as UpdateRoom;
    room.uuid = req.params.roomUuid as string;
    room.organizationUuid = req.params.organizationUuid as string;
    room.userUuid = req.user?.uuid as string;
    const result: Room = await updateRoom(room);
    return res.status(200).json(result);
}