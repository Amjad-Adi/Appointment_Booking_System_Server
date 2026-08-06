import {
    findAll,
    findById,
    create,
    update,
    updateByAdmin,
    isEmailFound,
    findByUid
} from "../../repositories/user.repository"
import {CreateUser,UserResponse,UpdateUserByAdmin,UpdateUser} from "../../models/user";
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
export async function getUsers():Promise<UserResponse[]>{
    return (await findAll()).rows
}

export async function getUser(uuid:string):Promise<UserResponse>{
    let result= await findById(uuid)
    if(result.rowCount==0){
        throw new NotFoundError("User");
    }
    return result.rows[0]
}

export async function getUserByFireBaseUid(uid:string):Promise<UserResponse>{
    let result= await findByUid(uid)
    if(result.rowCount==0){
        throw new NotFoundError("User");
    }
    return result.rows[0]
}

export async function createUser(user:CreateUser):Promise<UserResponse>{
    if(await isEmailFound(user.email)===true) {
        throw new ConflictError()
    }
    let result= await create(user)
    if(result.rowCount==0){
        throw new BadRequestErorr()
    }
    return result.rows[0];
}

export async function updateUser(user:UpdateUser,uuid:string):Promise<UserResponse>{
    let result= await update(user,uuid)
    if(result.rowCount==0){
        throw new NotFoundError("user")
    }
    return result.rows[0];
}

export async function updateUserByAdmin(user:UpdateUserByAdmin,uuid:string):Promise<UserResponse>{
    let result= await updateByAdmin(user,uuid)
    if(result.rowCount==0){
        throw new NotFoundError("user")
    }
    return result.rows[0];
}