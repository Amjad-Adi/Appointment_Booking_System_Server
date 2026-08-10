import {
    getUsers,
    getUser,
    updateUser,
    updateUserByAdmin,
    createUser,
    getUserByFireBaseUid
} from "../services/backend/user.service"
import { type Request, type Response } from "express";
import {CreateUser, UserResponse, UpdateUserByAdmin, UpdateUser, User} from "../models/user.model";
import {createUserByFireBase} from "../services/frontend/firebase-client.service";
import {findByUid} from "../repositories/user.repository";
import {getAuth} from "firebase/auth";
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
    let userRecord= await createUserByFireBase(user.email,user.password)
    user.uid=userRecord.uid
    const result:User=await createUser(user)
    return res.status(201).json(result)
}

export async function handleUpdateUser(req:Request,res:Response){
    let user:UpdateUser=(req.body)
    const result:User=await updateUser(user)
    return res.status(200).json(result)
}

//UNDONE YET
export async function handleUpdateCurrentUser(req:Request,res:Response){
    let user:UpdateUser=(req.body)
    const result:User=await updateUser(user)
    return res.status(200).json(result)
}

export async function handleUpdateUserByAdmin(req:Request,res:Response){
    let user:User=(req.body)
    const result:User=await updateUserByAdmin(user)
    return res.status(200).json(result)
}