import {
    findAll,
    findByUuid,
    create,
    update,
    isNameFound,
    countAll,
} from "../repositories/room.repository.js";

import { NotFoundError } from "../errors/not-found.error.js";
import { BadRequestError } from "../errors/bad-request.error.js";
import { ConflictError } from "../errors/conflict.error.js";

import { findIdByUuid } from "../repositories/organizaiton.repository.js";

import {
    RoomResponse,
    CreateRoom,
    UpdateRoom,
    Room,
    QueryRoom,
} from "../models/room.model.js";

import {
    AuthorizeOrganizationUser,
    getUserIdByUuid,
} from "./user.service.js";
import {getOrganizationIdByUuid} from "./organization.service";

export async function getRooms(query: QueryRoom): Promise<RoomResponse[]> {
    return findAll(query);
}

export async function getNumberOfRooms(query: QueryRoom):Promise<number> {
    return countAll(query);
}

export async function getRoom(roomUuid: string,organizationUuid:string|undefined): Promise<RoomResponse> {
    const result = await findByUuid(roomUuid,organizationUuid);
    if (result === undefined) {
        throw new NotFoundError("Room");
    }
    return result;
}

export async function createRoom(room: CreateRoom, userUuid: string,): Promise<Room> {
    await AuthorizeOrganizationUser(userUuid, room.organizationUuid);
    const organizationId = await findIdByUuid(room.organizationUuid,);
    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }
    room.organizationId = organizationId;
    if (await isNameFound(room.organizationUuid, room.name)) {
        throw new ConflictError();
    }
    const result = await create(room);
    if (result === undefined) {
        throw new BadRequestError();
    }
    return result;
}

export async function updateRoom(room: UpdateRoom,): Promise<Room> {
    await AuthorizeOrganizationUser(room.userUuid, room.organizationUuid,);
    if (room.assignedUserUuid !== undefined) {
        if (room.assignedUserUuid === null) {
            room.assignedUserId = null;
        } else {
            room.assignedUserId = await getUserIdByUuid(room.assignedUserUuid,);
            if (room.assignedUserId === undefined) {
                throw new NotFoundError('User');
            }
        }
    }
    const result = await update(room);
    if (result === undefined) {
        throw new NotFoundError('Room');
    }
    return result;
}

export async function getRoomIdByUuid(roomUuid: string): Promise<number> {
    const result = await findIdByUuid(roomUuid);
    if (result === undefined) {
        throw new NotFoundError("Room");
    }
    return result;
}
