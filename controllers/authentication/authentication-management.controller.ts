import type {CookieOptions, NextFunction, Request, Response} from "express";
import {fireBaseLogIn} from "../../services/frontend/firebase-client.service";
import {getAuth} from "firebase/auth";
import {UnauthorizedError} from "../../errors/unauthorized.error";
import {generateToken} from "./jwt.authentication.controller";
import {UserResponse} from "../../models/user.model";
import {getUidByUuid, getUser, getUserByFireBaseUid, getUserById} from "../../services/backend/user.service";
import {mapFirebaseError} from "../../middlewares/map-firebase-error";
import {findRefreshToken} from "../../repositories/refresh-token.repository";
import {RefreshToken} from "../../models/refresh-token.model";
import {createBlacklistedToken, deleteToken, getRefreshToken} from "../../services/backend/jwt-management-service";
import {BlacklistedToken, CreateBlacklistedToken} from "../../models/blacklisted-token.model";
//Cookie options look up best practises
const cookieOptions:CookieOptions = {
    httpOnly:true,
    secure:true,
    sameSite:'strict',
    maxAge:30*24*60*60*1000,
}
export async function login(req: Request, res: Response, next: NextFunction){
    const email=req.body.email
    const password=req.body.password
       let uid= await fireBaseLogIn(getAuth(), email, password) as string;
        if(uid==undefined){
            throw new UnauthorizedError()
        }
        let user:UserResponse=await getUserByFireBaseUid(uid);
        const tokens=await generateToken(uid);
        res.cookie('refreshToken',tokens.refreshToken,cookieOptions);
        res.json({
            accessToken:tokens.accessToken,
            user})
}

export async function refreshToken(req: Request, res: Response, next: NextFunction){
    const refreshTokenString=req.cookies.refreshToken as string;
    if(refreshTokenString===undefined){
        throw new UnauthorizedError()
    }
    const refreshTokenRecord:RefreshToken=await getRefreshToken(refreshTokenString)
    if (!refreshTokenRecord) {
        throw new UnauthorizedError();
    }
    if(Date.now()>refreshTokenRecord.expiresAtUTC.getTime()){
        await deleteToken(refreshTokenString)
        throw new UnauthorizedError()
    }
    const user = await getUserById(refreshTokenRecord.userId);
    const uid = await getUidByUuid(user.uuid);
        const tokens=await generateToken(uid);
        await deleteToken(refreshTokenString)
        res.cookie('refreshToken',tokens.refreshToken,cookieOptions);
        res.json({
            accessToken:tokens.accessToken,
            user})
}

export async function logOut(req: Request, res: Response, next: NextFunction){
    const blackListedToken:CreateBlacklistedToken={
        jti:req.user.jti,
        expiresAtUTC:req.user.exp,
        reason:"logout"
    }
    await createBlacklistedToken(blackListedToken)
    const refreshTokenString=req.cookies.refreshToken as string;
    await deleteToken(refreshTokenString)
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
}