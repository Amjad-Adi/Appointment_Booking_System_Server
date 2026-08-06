import {type NextFunction, type Request, type Response} from "express";
import type {} from "../utils/UserRequest";
import {UnauthorizedError} from "../errors/unauthorized.error";
import {getAuth} from "firebase-admin/auth";
import {getUserByFireBaseUid} from "../services/backend/user.service";

export async function authenticateUser(req:Request,res:Response,next:NextFunction){
    const authorizationHeader :string|undefined  = req.headers.authorization
    const token=authorizationHeader?.split(" ")[1]
    if (!token) {
        throw new UnauthorizedError();
    }
    const decodedToken= await getAuth().verifyIdToken(token)
    const fireBaseUid=decodedToken.uid;
    const user=await getUserByFireBaseUid(fireBaseUid);
    if(!user){
        throw new UnauthorizedError();
    }
    req.user=user;
    next();
}
