import {findAll,findById,create,update} from "../repositories/role.repository"
import {CreateRole, Role, UpdateRole} from "../models/role"
import {NotFoundError} from "../errors/not-found-error";
import {BadRequest} from "../errors/bad-request";
export async function getRoles():Promise<Role[]>{
    return (await findAll()).rows
}

export async function getRole(uuid:string):Promise<Role>{
    let result= await findById(uuid)
    if(result.rowCount==0){
        throw new NotFoundError("Role");
    }
    return result.rows[0]
}

export async function createRole(role:CreateRole):Promise<void>{
    let result= await create(role)
    if(result.rowCount==0){
        throw new BadRequest()
    }
    return result.rows[0];
}

export async function updateRole(role:UpdateRole,uuid:string):Promise<void>{
    let result= await update(role,uuid)
    if(result.rowCount==0){
        throw new NotFoundError("role")
    }
    return result.rows[0];
}