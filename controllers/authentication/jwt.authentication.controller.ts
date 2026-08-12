import {type NextFunction, type Request, type Response} from "express";
import type {} from "../../utils/UserRequest";
import {UnauthorizedError} from "../../errors/unauthorized.error";
import {getAuth} from "firebase-admin/auth"
import {ForbiddenError} from "../../errors/forbidden.error";
import bcrypt from 'bcrypt';
import crypto from "crypto";
import {hashRefreshToken} from "../../utils/hash";
import {createRefreshToken} from "../../services/backend/jwt-management-service";
import {CreateRefreshToken, RefreshToken} from "../../models/refresh-token.model";
import {UserRecord} from "firebase-admin/auth";
import {getIdByUuid, getUserByFireBaseUid} from "../../services/backend/user.service";
import {ConflictError} from "../../errors/conflict.error";
import {NotFoundError} from "../../errors/not-found.error";
import jwt, {JwtPayload, SignOptions, VerifyOptions} from "jsonwebtoken";
import {mapFirebaseError} from "../../middlewares/map-firebase-error";
import {User, UserResponse} from "../../models/user.model";
import {getBlackListedToken} from "../../services/backend/jwt-management-service";
export const JWT_SECRET=process.env.JWT_SECRET as string
export const JWT_REFRESH_SECRET=process.env.JWT_REFRESH_SECRET as string

export async function authenticateToken(req:Request,res:Response,next:NextFunction){
    const authorizationHeader: string | undefined = req.headers.authorization
    const token = authorizationHeader?.split(" ")[1]
    if (!token) {
        throw new UnauthorizedError();
    }
    try{
        const verifyOptions:VerifyOptions = {
            issuer:"appointment-booking-server",
            audience:"appointment-booking-api",
        }
        const decodedToken =jwt.verify(token,JWT_SECRET,verifyOptions) as JwtPayload;
        if (!decodedToken.sub || !decodedToken.jti) {
            throw new UnauthorizedError();
        }
        const blacklistedToken = await getBlackListedToken(decodedToken.jti);
        if (blacklistedToken) {
            throw new UnauthorizedError();
        }
        const userUid=decodedToken.sub
        const user:UserResponse = await getUserByFireBaseUid(userUid);
        if (typeof decodedToken.sub!=="string" || typeof decodedToken.jti!=="string" || typeof decodedToken.exp!=="number") {
            throw new UnauthorizedError();
        }
        req.user = {
            ...user,
            uid: decodedToken.sub,
            jti: decodedToken.jti,
            exp: new Date(decodedToken.exp * 1000)
        };
        next();
        } catch (e) {
        if (e instanceof jwt.TokenExpiredError||e instanceof jwt.JsonWebTokenError) {
            return next(new UnauthorizedError());
        }
        return next(e);
    }
}



export async function generateToken(userUid:string){
    const payload:JwtPayload={
        sub: userUid
    };
    const signOptions:SignOptions={
        expiresIn: '1h',
        issuer:"appointment-booking-server",
        audience:"appointment-booking-api",
        jwtid:crypto.randomUUID()
    }
    const accessToken:string=jwt.sign(payload,JWT_SECRET,signOptions)
    const refreshToken:string=crypto.randomBytes(32).toString('hex')
    const refreshHashedToken:string=hashRefreshToken(refreshToken)
    const currentUser:UserResponse = await getUserByFireBaseUid(userUid);
    const currentUserId:number=await getIdByUuid(currentUser.uuid);
    const refreshTokenToStore:CreateRefreshToken={
        userId: currentUserId,
        tokenHash:refreshHashedToken
    }
    await createRefreshToken(refreshTokenToStore)
    return {accessToken,refreshToken}
}
