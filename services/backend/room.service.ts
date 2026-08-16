import {
    findAll,
    findById,
    create,
    update,
    isNameFound
} from "../../repositories/room.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
import {findIdByUuid} from "../../repositories/organizaiton.repository";
import {RoomResponse,CreateRoom,UpdateRoom,Room} from "../../models/room.model";
export async function getRooms(organizationUuid:string):Promise<RoomResponse[]>{
    return (await findAll(organizationUuid))
}

export async function getRoom(organizationUuid:string,roomUuid:string):Promise<RoomResponse>{
    let result:RoomResponse= await findById(organizationUuid,roomUuid)
    if(result===undefined){
        throw new NotFoundError("Rooom");
    }
    return result
}


export async function createRoom(room:CreateRoom):Promise<Room>{
    let organizationId:number= await findIdByUuid(room.organizationUuid)
    if(organizationId===undefined){
        throw new NotFoundError("Organization");
    }
    room.organizationId=organizationId
    if(await isNameFound(room.organizationUuid,room.name)===true) {
        throw new ConflictError()
    }
    let result:Room= await create(room)
    if(result===undefined){
        throw new BadRequestErorr()
    }
    return result;
}

export async function updateRoom(room:UpdateRoom):Promise<Room>{
    let result:Room= await update(room)
    if(result===undefined){
        throw new NotFoundError("room")
    }
    return result;
}