import {
    findAll,
    findByUuid,
    create,
    update,
    findByUid, findIdByUuid, findUidByUuid, findById, countAll, findPictureIdByUuid, findByEmail
} from "../repositories/user.repository"
import {RegisterUser, UserResponse, UpdateCurrentUser, User, QueryUser, CreateUser, UpdateUserByAdmin } from "../models/user.model";
import {NotFoundError} from "../errors/not-found.error";
import {findUserOrganizationByUuid} from "../repositories/organizaiton.repository";
export async function getUsers(query:QueryUser):Promise<UserResponse[]>{
    return (await findAll(query))
}

export async function getNumberOfUsers(query:QueryUser):Promise<number>{
    return (await countAll(query))
}

export async function getUser(uuid:string,organizationUuid:string):Promise<UserResponse>{
    const result:UserResponse= await findByUuid(uuid,organizationUuid)
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result
}

export async function getUserByFireBaseUid(uid:string):Promise<UserResponse>{
    const result:UserResponse= await findByUid(uid)
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result
}

export async function getUserById(id:number):Promise<UserResponse>{
    const result:UserResponse= await findById(id)
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result
}

export async function getUserByEmail(email:string):Promise<UserResponse>{
    const result:UserResponse= await findByEmail(email)
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result
}

export async function getUserPictureIdByUuid(userUuid:string):Promise<string>{
    const result:string|undefined= await findPictureIdByUuid(userUuid)
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result
}

export async function createUser(user:CreateUser):Promise<User>{
    return create(user)
}

export async function updateUser(user:UpdateCurrentUser|UpdateUserByAdmin):Promise<User>{
    const result:User= await update(user)
    if(result===undefined){
        throw new NotFoundError("user")
    }
    return result;
}

export async function isUserWorkingByUuid(userUuid:string):Promise<boolean>{
    return (await findUserOrganizationByUuid(userUuid)) !== undefined
}

export async function getUserIdByUuid(uuid:string):Promise<number>{
    let result:number= await findIdByUuid(uuid);
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result;
}


export async function getUserUidByUuid(uuid:string):Promise<string>{
    let result:string= await findUidByUuid(uuid);
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result;
}
