import type {CookieOptions, NextFunction, Request, Response} from "express";
import {fireBaseLogIn, invitationReceive} from "../../services/firebase-client.service.js";
import {getAuth} from "firebase/auth";
import {UnauthorizedError} from "../../errors/unauthorized.error.js";
import {generateToken} from "./jwt.authentication.controller.js";
import {UserResponse} from "../../models/user.model.js";
import {getUserUidByUuid, getUser, getUserByFireBaseUid, getUserById} from "../../services/user.service.js";
import {mapFirebaseError} from "../../middlewares/map-firebase-error.js";
import {findRefreshToken, remove} from "../../repositories/refresh-token.repository.js";
import {} from "../../utils/Request.js"
import {RefreshToken} from "../../models/refresh-token.model.js";
import {
    createBlacklistedToken,
    revokeToken,
    getRefreshToken,
    removeToken
} from "../../services/jwt-management-service.js";
import {BlacklistedToken, CreateBlacklistedToken} from "../../models/blacklisted-token.model.js";
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

export async function invitationLogin(req: Request, res: Response, next: NextFunction){
    const email=req.query.email as string
    let uid:string|undefined= "hi"//await invitationReceive(getAuth(),email,signInLink) ;//REQUIRES FRONT END
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
    if(refreshTokenRecord.revoked){
        throw new UnauthorizedError();
    }
    if(Date.now()>refreshTokenRecord.expiresAtUTC.getTime()){
        await removeToken(refreshTokenString)
        throw new UnauthorizedError()
    }
    const user = await getUserById(refreshTokenRecord.userId);
    const uid = await getUserUidByUuid(user.uuid);
    const tokens=await generateToken(uid);
    await removeToken(refreshTokenString)
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
        await revokeToken(refreshTokenString)
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
}