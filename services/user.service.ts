import {findAll, findById, create, update, updateByAdmin, findByEmail} from "../repositories/user.repository"
import {CreateUser,User,UpdateUserByAdmin,UpdateUser} from "../models/user";
import {NotFoundError} from "../errors/not-found-error";
import {BadRequest} from "../errors/bad-request";
import {Conflict} from "../errors/conflict";
export async function getUsers():Promise<User[]>{
    return (await findAll()).rows
}

export async function getUser(uuid:string):Promise<User>{
    let result= await findById(uuid)
    if(result.rowCount==0){
        throw new NotFoundError("User");
    }
    return result.rows[0]
}

export async function createUser(user:CreateUser):Promise<CreateUser>{
    if(await findByEmail(user.email)===true) {
        throw new Conflict()
    }
    let result= await create(user)
    if(result.rowCount==0){
        throw new BadRequest()
    }
    return result.rows[0];
}

export async function updateUser(user:UpdateUser,uuid:string):Promise<UpdateUser>{
    let result= await update(user,uuid)
    if(result.rowCount==0){
        throw new NotFoundError("user")
    }
    return result.rows[0];
}

export async function updateUserByAdmin(user:UpdateUserByAdmin,uuid:string):Promise<UpdateUserByAdmin>{
    let result= await updateByAdmin(user,uuid)
    if(result.rowCount==0){
        throw new NotFoundError("user")
    }
    return result.rows[0];
}