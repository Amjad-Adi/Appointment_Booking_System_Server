import {type NextFunction, type Request, type Response} from "express";
import {UnauthorizedError} from "../../errors/unauthorized.error";
import crypto from "crypto";
import { generateRawToken, generateHashToken} from "../../utils/hash";
import {createRefreshToken} from "../../services/jwt-management-service";
import {CreateRefreshToken} from "../../models/refresh-token.model";
import {getUserIdByUuid, getUserByFireBaseUid} from "../../services/user.service";
import jwt, { JwtPayload, SignOptions, VerifyOptions} from "jsonwebtoken";
import { UserResponse} from "../../models/user.model";
import {getBlackListedToken} from "../../services/jwt-management-service";

export const JWT_SECRET=process.env.JWT_SECRET as string
export const ACCESS_TOKEN_EXPIRES_FOR_DEPLOYMENT="12h";
export const ACCESS_TOKEN_EXPIRES_FOR_DEVELOPMENT="1d";
export const REFRESH_TOKEN_EXPIRES_FOR_DEVELOPMENT =365*24*60*60*1000
export const REFRESH_TOKEN_EXPIRES_FOR_DEPLOYMENT = 365*24*60*60*1000
export const refreshTokenExpiresIn = process.env.NODE_ENV === "production" ? REFRESH_TOKEN_EXPIRES_FOR_DEVELOPMENT : REFRESH_TOKEN_EXPIRES_FOR_DEPLOYMENT;

export async function authenticateToken(req:Request,res:Response,next:NextFunction){
    const token = req.cookies.accessToken;
    if (!token) {
        throw new UnauthorizedError();
    }
    const verifyOptions:VerifyOptions = {
        issuer:"appointment-booking-server",
        audience:"appointment-booking-api",
    }
    const decodedToken =jwt.verify(token,JWT_SECRET,verifyOptions) as JwtPayload;
    if (typeof decodedToken.sub!=="string" || typeof decodedToken.jti!=="string" || typeof decodedToken.exp!=="number") {
        throw new UnauthorizedError();
    }
    const blacklistedToken = await getBlackListedToken(decodedToken.jti);
    if (blacklistedToken) {
        throw new UnauthorizedError();
    }
    const userUid=decodedToken.sub
    const user:UserResponse = await getUserByFireBaseUid(userUid);
    req.user = {
        ...user,
        uid: decodedToken.sub,
        jti: decodedToken.jti,
        exp: new Date(decodedToken.exp * 1000)
    };
    next();
}



export async function generateToken(userUid:string){
    const payload:JwtPayload={
        sub: userUid
    };
    const signOptions:SignOptions={
        expiresIn: process.env.NODE_ENV=="production"?ACCESS_TOKEN_EXPIRES_FOR_DEVELOPMENT:ACCESS_TOKEN_EXPIRES_FOR_DEPLOYMENT,
        issuer:"appointment-booking-server",
        audience:"appointment-booking-api",
        jwtid:crypto.randomUUID()
    }
    const accessToken:string=jwt.sign(payload,JWT_SECRET,signOptions)
    const refreshToken:string=generateRawToken()
    const refreshHashedToken:string=generateHashToken(refreshToken)
    const currentUser:UserResponse = await getUserByFireBaseUid(userUid);
    const currentUserId:number=await getUserIdByUuid(currentUser.uuid);

    const refreshTokenToStore:CreateRefreshToken={
        userId: currentUserId,
        tokenHash:refreshHashedToken,
        expiresAtUTC: new Date(Date.now() +refreshTokenExpiresIn),
    }
    await createRefreshToken(refreshTokenToStore)
    return {accessToken,refreshToken}
}
