import {
    findAll,
    findByUuid,
    create,
    update,
    isNameFound
} from "../../repositories/room.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
import {findIdByUuid, isEmailFound, isPhoneNumberFound} from "../../repositories/organizaiton.repository";
import {RoomResponse,CreateRoom,UpdateRoom,Room} from "../../models/room.model";
<<<<<<< Updated upstream
import {ForbiddenError} from "../../errors/forbidden.error";
import {getUserOrganization} from "./organization.service";
import {isUserAuthorizedToOrganization, isUserWorking} from "./user.service";
=======
import {AuthorizeOrganizationUser} from "./user.service";
>>>>>>> Stashed changes
export async function getRooms(organizationUuid:string,userUuid:string):Promise<RoomResponse[]>{
    await AuthorizeOrganizationUser(userUuid,organizationUuid);
    return (await findAll(organizationUuid))
}

export async function getRoom(roomUuid:string,organizationUuid:string,userUuid:string):Promise<RoomResponse>{
    await AuthorizeOrganizationUser(userUuid,organizationUuid);
    let result:RoomResponse= await findByUuid(organizationUuid,roomUuid)
    if(result===undefined){
        throw new NotFoundError("Room");
    }
    return result
}


export async function createRoom(room:CreateRoom,userUuid:string):Promise<Room>{
    await AuthorizeOrganizationUser(userUuid,room.organizationUuid)
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

export async function updateRoom(room:UpdateRoom,organizationUuid:string,userUuid:string):Promise<Room>{
    await AuthorizeOrganizationUser(userUuid,organizationUuid)
    let roomCheck:RoomResponse=await getRoom(organizationUuid,room.uuid,userUuid)//check if that organizaiton have that room
    if(roomCheck===undefined){
        throw new NotFoundError("Room");
    }
    let result:Room= await update(room)
    if(result===undefined){
        throw new NotFoundError("Room")
    }
    return result;
}
