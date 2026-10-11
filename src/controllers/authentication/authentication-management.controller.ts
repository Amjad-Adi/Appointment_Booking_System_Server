import type {CookieOptions, Request, Response} from "express";
import {UnauthorizedError} from "../../errors/unauthorized.error";
import {generateToken, refreshTokenExpiresIn} from "./jwt.authentication.controller";
import {UserResponse} from "../../models/user.model";
import {getUserUidByUuid, getUserByFireBaseUid, getUserById} from "../../services/user.service";
import {  firebaseAdminApp } from "../../config/firebase";
import {RefreshToken} from "../../models/refresh-token.model";
import { CreateBlacklistedToken} from "../../models/blacklisted-token.model";
import {getAuth} from "firebase-admin/auth";
import { createBlacklistedToken, getRefreshToken, removeToken, revokeToken } from '../../services/jwt-management-service';

//Cookie options look up best practises
const cookieOptions:CookieOptions = {
    httpOnly:true,
    secure:true,
    sameSite:'strict',
}
const accessCookieOptions: CookieOptions = cookieOptions&& {maxAge:
        process.env.NODE_ENV === "production"
            ? 25 * 60 * 60 * 1000
            : 13 * 60 * 60 * 1000,
};
const refreshCookieOptions:CookieOptions=cookieOptions&& {maxAge:refreshTokenExpiresIn+60*60*1000}

export async function login(req: Request, res: Response, ){
    const { idToken } = req.body;
    if (!idToken) {
        throw new UnauthorizedError();
    }
    const decodedToken = await getAuth(firebaseAdminApp).verifyIdToken(
        idToken,
    );
    const uid = decodedToken.uid;
    const user: UserResponse = await getUserByFireBaseUid(uid);
    const tokens = await generateToken(uid);
    res.cookie(
        'accessToken',
        tokens.accessToken,
        accessCookieOptions,
    );
    res.cookie(
        'refreshToken',
        tokens.refreshToken,
        refreshCookieOptions,
    );
    res.status(200).json(user);
}

export async function refreshToken(req: Request, res: Response){
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
    res.cookie('accessToken',tokens.accessToken,accessCookieOptions);
    res.cookie('refreshToken',tokens.refreshToken,refreshCookieOptions);
    res.status(200).json({user});
}

export async function logOut(req: Request, res: Response){
    const blackListedToken:CreateBlacklistedToken={
        jti:req.user?.jti as string,
        expiresAtUTC:req.user?.exp as Date,
        reason:"logout"
    }
    await createBlacklistedToken(blackListedToken)
    const refreshTokenString=req.cookies.refreshToken as string;
        await revokeToken(refreshTokenString)
    res.clearCookie('refreshToken');
    res.status(204).send();
}