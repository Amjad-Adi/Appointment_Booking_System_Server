import type {CookieOptions, NextFunction, Request, Response} from "express";
import {fireBaseLogIn} from "../../services/frontend/firebase-client.service";
import {getAuth} from "firebase/auth";
import {UnauthorizedError} from "../../errors/unauthorized.error";
import {generateToken} from "./jwt.authentication.controller";
import {UserResponse} from "../../models/user.model";
import {getUidByUuid, getUser, getUserByFireBaseUid, getUserById} from "../../services/backend/user.service";
import {mapFirebaseError} from "../../middlewares/map-firebase-error";
import {findRefreshToken, remove} from "../../repositories/refresh-token.repository";
import {RefreshToken} from "../../models/refresh-token.model";
import {
    createBlacklistedToken,
    revokeToken,
    getRefreshToken,
    removeToken
} from "../../services/backend/jwt-management-service";
import {BlacklistedToken, CreateBlacklistedToken} from "../../models/blacklisted-token.model";
//Cookie options look up best practises
const cookieOptions:CookieOptions = {
    httpOnly:true,
    secure:true,
    sameSite:'strict',
}
<<<<<<< Updated upstream:controllers/authentication/authentication-management.controller.ts
=======
const accessCookieOptions:CookieOptions=cookieOptions&& {maxAge:30*60*1000,}

const refreshCookieOptions:CookieOptions=cookieOptions&& {maxAge:365*24*60*60*1000,}

>>>>>>> Stashed changes:src/controllers/authentication/authentication-management.controller.ts
export async function login(req: Request, res: Response, next: NextFunction){
    const email=req.body.email
    const password=req.body.password
       let uid= await fireBaseLogIn(getAuth(), email, password) as string;
        if(uid==undefined){
            throw new UnauthorizedError()
        }
        let user:UserResponse=await getUserByFireBaseUid(uid);
        const tokens=await generateToken(uid);
        res.cookie('accessToken',tokens.accessToken,accessCookieOptions);
        res.cookie('refreshToken',tokens.refreshToken,refreshCookieOptions);
        res.status(200).json({user});
}

<<<<<<< Updated upstream:controllers/authentication/authentication-management.controller.ts
=======
export async function invitationLogin(req: Request, res: Response, next: NextFunction){
    const email=req.query.email as string
    let uid:string|undefined= "hi"//await invitationReceive(getAuth(),email,signInLink) ;//REQUIRES FRONT END
    if(uid==undefined){
        throw new UnauthorizedError()
    }
    let user:UserResponse=await getUserByFireBaseUid(uid);
    const tokens=await generateToken(uid);
    res.cookie('accessToken',tokens.accessToken,accessCookieOptions);
    res.cookie('refreshToken',tokens.refreshToken,refreshCookieOptions);
    res.status(200).json({user});
}

>>>>>>> Stashed changes:src/controllers/authentication/authentication-management.controller.ts
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
    const uid = await getUidByUuid(user.uuid);
    const tokens=await generateToken(uid);
    await removeToken(refreshTokenString)
    res.cookie('accessToken',tokens.accessToken,accessCookieOptions);
    res.cookie('refreshToken',tokens.refreshToken,refreshCookieOptions);
    res.status(200).json({user});
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