import {
    findAll,
    findByUuid,
    create,
    update,
    updateByAdmin,
    isEmailFound,
    findByUid, findIdByUuid, findUidByUuid, findById
} from "../../repositories/user.repository"
import {CreateUser, UserResponse, UpdateUserByAdmin, UpdateUser, User} from "../../models/user.model";
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
import {findUserOrganization} from "../../repositories/organizaiton.repository";
export async function getUsers():Promise<UserResponse[]>{
    return (await findAll())
}

export async function getUser(uuid:string):Promise<UserResponse>{
    let result:UserResponse= await findByUuid(uuid)
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result
}

export async function getUserByFireBaseUid(uid:string):Promise<UserResponse>{
    let result:UserResponse= await findByUid(uid)
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result
}

export async function getUserById(id:number):Promise<UserResponse>{
    let result:UserResponse= await findById(id)
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result
}

export async function createUser(user:CreateUser):Promise<User>{
    if(await isEmailFound(user.email)===true) {
        throw new ConflictError()
    }
    let result:User= await create(user)
    if(result===undefined){
        throw new BadRequestErorr()
    }
    return result;
}

export async function updateUser(user:UpdateUser):Promise<User>{
    let result:User= await update(user)
    if(result===undefined){
        throw new NotFoundError("user")
    }
    return result;
}

export async function updateUserByAdmin(user:UpdateUserByAdmin):Promise<User>{
    let result:User= await updateByAdmin(user)
    if(result===undefined){
        throw new NotFoundError("user")
    }
    return result;
}


export async function isUserWorking(userUuid:string):Promise<boolean>{
    return (await findUserOrganization(userUuid)) !== undefined
}


export async function getIdByUuid(uuid:string):Promise<number>{
    let result:number= await findIdByUuid(uuid);
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result;
}


export async function getUidByUuid(uuid:string):Promise<string>{
    let result:string= await findUidByUuid(uuid);
    if(result===undefined){
        throw new NotFoundError("User");
    }
    return result;
}