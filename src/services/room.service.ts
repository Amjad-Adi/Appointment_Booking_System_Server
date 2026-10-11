import { CreateRoom, QueryRoom, Room, RoomResponse, UpdateRoom } from '../models/room.model';
import { countAll, create, findAll, findByUuid,findIdByUserUuid as findRoomIdByUserUuid, findIdByUuid, update } from '../repositories/room.repository';
import { NotFoundError } from '../errors/not-found.error';
import { verifyOrganizationOwnership } from '../middlewares/authorization/authorization';

export async function getRooms(query: QueryRoom): Promise<RoomResponse[]> {
    return findAll(query);
}

export async function getNumberOfRooms(query: QueryRoom):Promise<number> {
    return countAll(query);
}

export async function getRoom(roomUuid: string,organizationUuid:string,userUuid:string): Promise<RoomResponse> {
    await verifyOrganizationOwnership(userUuid,organizationUuid);
    const result = await findByUuid(roomUuid,organizationUuid);
    if (result === undefined) {
        throw new NotFoundError("Room");
    }
    return result;
}

export async function createRoom(room: CreateRoom): Promise<Room> {
    await verifyOrganizationOwnership(room.userUuid,room.organizationUuid)
    return await create(room);
}

export async function updateRoom(room: UpdateRoom): Promise<Room> {
    await verifyOrganizationOwnership(room.userUuid,room.organizationUuid)
    const result = await update(room);
    if (result === undefined) {
        throw new NotFoundError('Room');
    }
    return result;
}

export async function getRoomIdByUuid(roomUuid:string,organizationUuid:string):Promise<number>{
    const result = await findIdByUuid(roomUuid,organizationUuid);
    if (result === undefined) {
        throw new NotFoundError("Room");
    }
    return result;
}


export async function getRoomIdByUserUuid(userUuid:string,organizationUuid:string):Promise<number>{
    const result = await findRoomIdByUserUuid(userUuid,organizationUuid);
    if (result === undefined) {
        throw new NotFoundError("Room");
    }
    return result;
}
