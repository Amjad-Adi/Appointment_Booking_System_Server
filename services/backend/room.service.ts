import {
    findAll,
    findByUuid,
    create,
    update,
    isNameFound,countAll
} from "../../repositories/room.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
import {findIdByUuid} from "../../repositories/organizaiton.repository";
import {RoomResponse, CreateRoom, UpdateRoom, Room, QueryRoom} from "../../models/room.model";
import {AuthorizeOrganizationUser} from "./user.service";

export async function getRooms(query:QueryRoom,organizationUuid:string,userUuid:string):Promise<RoomResponse[]>{
    await AuthorizeOrganizationUser(userUuid,organizationUuid);
    return (await findAll(query,organizationUuid))
}
export async function getNumberOfRooms(query:QueryRoom,organizationUuid:string,userUuid:string):Promise<number>{
    await AuthorizeOrganizationUser(userUuid,organizationUuid);
    return (await countAll(query,organizationUuid))
}

export async function getRoom(roomUuid:string,organizationUuid:string,userUuid:string):Promise<RoomResponse>{
    await AuthorizeOrganizationUser(userUuid,organizationUuid);
    const result:RoomResponse= await findByUuid(organizationUuid,roomUuid)
    if(result===undefined){
        throw new NotFoundError("Room");
    }
    return result
}


export async function createRoom(room:CreateRoom,userUuid:string):Promise<Room>{
    await AuthorizeOrganizationUser(userUuid,room.organizationUuid)
    const organizationId:number= await findIdByUuid(room.organizationUuid)
    if(organizationId===undefined){
        throw new NotFoundError("Organization");
    }
    room.organizationId=organizationId
    if(await isNameFound(room.organizationUuid,room.name)===true) {
        throw new ConflictError()
    }
    const result:Room= await create(room)
    if(result===undefined){
        throw new BadRequestErorr()
    }
    return result;
}

export async function updateRoom(room:UpdateRoom):Promise<Room>{
    await AuthorizeOrganizationUser(room.userUuid,room.organizationUuid)
    const result:Room= await update(room)
    if(result===undefined){
        throw new NotFoundError("Room")
    }
    return result;
}
