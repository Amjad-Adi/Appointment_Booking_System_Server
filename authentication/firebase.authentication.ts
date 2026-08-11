import {type NextFunction, type Request, type Response} from "express";
import type {} from "../utils/UserRequest";
import {UnauthorizedError} from "../errors/unauthorized.error";
import {getAuth} from "firebase-admin/auth";
import {getUserByFireBaseUid} from "../services/backend/user.service";
import {ForbiddenError} from "../errors/forbidden.error";
import {ConflictError} from "../errors/conflict.error";
import {NotFoundError} from "../errors/not-found.error";
import {mapFirebaseError} from "../middlewares/map-firebase-error";

export async function authenticateUser(req:Request,res:Response,next:NextFunction){
    try {
        const authorizationHeader: string | undefined = req.headers.authorization
        const token = authorizationHeader?.split(" ")[1]
        if (!token) {
            throw new UnauthorizedError();
        }
        const decodedToken = await getAuth().verifyIdToken(token)
        const fireBaseUid = decodedToken.uid;
        const user = await getUserByFireBaseUid(fireBaseUid);
        req.user = user;
        req.user.uid=decodedToken.uid;
        next();
    }catch (e) {
        next(mapFirebaseError(e))
    }
}
