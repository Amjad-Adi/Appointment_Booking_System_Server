import {findAll,findById,create,update} from "../repositories/role.repository"
import {CreateRole, Role, UpdateRole} from "../models/role"
import {QueryResult} from "pg";
import {NotFoundError} from "../errors/not-found-error";
import {BadRequest} from "../errors/bad-request";
export async function getRoles():Promise<Role[]>{
    return (await findAll()).rows
}

export async function getRole(uuid:string):Promise<Role>{
    return (await findById(uuid)).rows[0]
}

export async function createRole(role:CreateRole):Promise<void>{
    let result= await create(role)
    if(result.rowCount==0){
        throw new BadRequest()
    }
}

export async function updateRole(role:UpdateRole,uuid:string):Promise<void>{
    let result= await update(role,uuid)
    if(result.rowCount==0){
        throw new NotFoundError("role")
    }
}