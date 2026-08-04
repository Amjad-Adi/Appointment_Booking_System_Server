import {getUsers,getUser,updateUser,updateUserByAdmin,createUser} from "../services/user.service"
import { type Request, type Response } from "express";
import {CreateUser,User,UpdateUserByAdmin,UpdateUser} from "../models/user";
export async function handleGetUsers(req:Request,res:Response){
    const result:User[]=await getUsers()
    return res.status(200).json(result)
}

export async function handleGetUser(req:Request,res:Response){
    let uuid:string=(req.params.uuid) as any as string;
    const result:User=await getUser(uuid)
    return res.status(200).json(result)
}

export async function handleCreateUser(req:Request,res:Response){
    let user:CreateUser=(req.body)
    const result:CreateUser=await createUser(user)
    return res.status(201).json(result)
}

export async function handleUpdateUser(req:Request,res:Response){
    let user:UpdateUser=(req.body)
    let uuid:string=(req.params.uuid) as any as string;
    const result:UpdateUser=await updateUser(user,uuid)
    return res.status(200).json(result)
}

export async function handleUpdateUserByAdmin(req:Request,res:Response){
    let user:UpdateUserByAdmin=(req.body)
    let uuid:string=(req.params.uuid) as any as string;
    const result:UpdateUserByAdmin=await updateUserByAdmin(user,uuid)
    return res.status(200).json(result)
}