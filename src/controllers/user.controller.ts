import {
    getUsers,
    getUser,
    updateUser,
    updateUserByAdmin,
    createUser, getNumberOfUsers
} from "../services/user.service.js"
import { type Request, type Response } from "express";
import {createFireBaseUser, updateFireBaseUser} from "../services/firebase-admin.service.js"
import {} from "../utils/Request.js"
import {BadRequestError} from "../errors/bad-request.error.js";
import {UserRecord} from "firebase-admin/auth";
import {CreateUser, QueryUser, UpdateUser, User, UserResponse} from "../models/user.model.js";
import {QueryResponse} from "../models/query.model.js";
export async function handleGetUsers(req:Request,res:Response){
    const query:QueryUser= req.validatedQuery as unknown as QueryUser;
    const [users,totalUsers]=await Promise.all([getUsers(query),getNumberOfUsers(query)])
    query.offset=(query?.page-1)*query?.limit
    const baseUrl=req.originalUrl?.split("?")[0]
    const responseResult:QueryResponse=new QueryResponse(users,totalUsers,baseUrl,query?.page,query?.limit)
    return res.status(200).json(responseResult)
}

export async function handleGetUser(req:Request,res:Response){
    const uuid:string=(req.params.userUuid) as any as string;
    const result:UserResponse=await getUser(uuid)
    return res.status(200).json(result)
}

export async function handleGetCurrentUser(req:Request,res:Response){
        return res.status(200).json(req.user)
}

export async function handleCreateUser(req:Request,res:Response){
    const user: CreateUser = (req.body)
    let userRecord: UserRecord | undefined;
    try {
        userRecord = await createFireBaseUser(user.email, user.password)
    }catch(err){
        throw new BadRequestError()
    }
    user.uid = (userRecord as UserRecord).uid
    const result: User = await createUser(user)
    return res.status(201).json(result)
}

export async function handleUpdateUser(req:Request,res:Response){
    const user:UpdateUser=(req.body)
    const result:User=await updateUser(user)
    return res.status(200).json(result)
}

export async function handleUpdateCurrentUser(req:Request,res:Response){
    const user:UpdateUser=(req.body)
    user.uuid = req.user.uuid;
    user.uid = req.user.uid;
    if(user.password !== undefined){
        try {
            await updateFireBaseUser(user.uid, user.password)
        }catch(err){
            throw new BadRequestError()
        }
    }
    const result:User=await updateUser(user)
    return res.status(200).json(result)
}

export async function handleUpdateUserByAdmin(req:Request,res:Response){
    const uuid:string=(req.params.userUuid) as any as string;
    const user:User=(req.body)
    user.uuid=uuid;
    const result:User=await updateUserByAdmin(user)
    return res.status(200).json(result)
}