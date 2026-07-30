import {getRoles,getRole,updateRole,createRole} from "../services/role.service"
import { type Request, type Response } from "express";
import {CreateRole, Role, UpdateRole} from "../models/role"
export async function handleGetRoles(req:Request,res:Response){
    const result:Role[]=await getRoles()
        return res.status(200).json(result)
}

export async function handleGetRole(req:Request,res:Response){
    let uuid:string=(req.params.uuid) as any as string;
    const result:Role=await getRole(uuid)
    return res.status(200).json(result)
}

export async function handleCreateRole(req:Request,res:Response){
    let role:CreateRole=(req.body)
    const result:void=await createRole(role)
    return res.status(201).json(result)
}

export async function handleUpdateRole(req:Request,res:Response){
    let role:UpdateRole=(req.body)
    let uuid:string=(req.params.uuid) as any as string;
    const result:void=await updateRole(role,uuid)
    return res.status(200).json(result)
}