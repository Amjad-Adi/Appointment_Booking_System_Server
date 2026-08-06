import {
    getUsers,
    getUser,
    updateUser,
    updateUserByAdmin,
    createUser,
    getUserByFireBaseUid
} from "../services/backend/user.service"
import { type Request, type Response } from "express";
import {CreateUser,UserResponse,UpdateUserByAdmin,UpdateUser} from "../models/user";
import {createFireBaseUser} from "../services/backend/firebase-admin.service";
import {UserRecord} from "firebase-admin/auth";
import {findByUid} from "../repositories/user.repository";
export async function handleGetUsers(req:Request,res:Response){
    const result:UserResponse[]=await getUsers()
    return res.status(200).json(result)
}

export async function handleGetUser(req:Request,res:Response){
    let uuid:string=(req.params.uuid) as any as string;
    const result:UserResponse=await getUser(uuid)
    return res.status(200).json(result)
}

export async function handleGetCurrentUser(req:Request,res:Response){
    return res.status(200).json(req.user)
}

export async function handleCreateUser(req:Request,res:Response){
    let user:CreateUser=(req.body)
    let userRecord :UserRecord= await createFireBaseUser(user.email,user.password)
    user.uid=userRecord.uid
    const result:UserResponse=await createUser(user)
    return res.status(201).json(result)
}

export async function handleUpdateUser(req:Request,res:Response){
    let user:UpdateUser=(req.body)
    let uuid:string=(req.params.uuid) as any as string;
    const result:UserResponse=await updateUser(user,uuid)
    return res.status(200).json(result)
}

//UNDONE YET
export async function handleUpdateCurrentUser(req:Request,res:Response){
    let user:UpdateUser=(req.body)
    let uuid:string=(req.params.uuid) as any as string;
    const result:UserResponse=await updateUser(user,uuid)
    return res.status(200).json(result)
}

export async function handleUpdateUserByAdmin(req:Request,res:Response){
    let user:UserResponse=(req.body)
    let uuid:string=(req.params.uuid) as any as string;
    const result:UserResponse=await updateUserByAdmin(user,uuid)
    return res.status(200).json(result)
}