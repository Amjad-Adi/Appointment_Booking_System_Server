import {
    create as createRefreshTokenService, findRefreshToken, remove,revoke
} from "../../repositories/refresh-token.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
import {CreateService, Service, ServiceResponse, UpdateService} from "../../models/service.model";
import {findIdByUuid} from "../../repositories/organizaiton.repository";
import {CreateRefreshToken, RefreshToken} from "../../models/refresh-token.model";
import {findBlacklistedToken,create as createBlacklistedTokenService} from "../../repositories/blacklisted-token.repository";
import {BlacklistedToken, CreateBlacklistedToken} from "../../models/blacklisted-token.model";
import {UnauthorizedError} from "../../errors/unauthorized.error";
import {hashRefreshToken} from "../../utils/hash";

export async function getBlackListedToken(jti:string):Promise<BlacklistedToken>{
    return  await findBlacklistedToken(jti)
}

export async function createBlacklistedToken(blacklistedToken:CreateBlacklistedToken):Promise<BlacklistedToken>{
    let result:BlacklistedToken= await createBlacklistedTokenService(blacklistedToken)
    if(result===undefined){
        throw new Error()
    }
    return result;
}


export async function createRefreshToken(refreshToken:CreateRefreshToken):Promise<RefreshToken>{
    let result:RefreshToken= await createRefreshTokenService(refreshToken)
    if(result===undefined){
        throw new Error()
    }
    return result;
}

export async function getRefreshToken(token:string):Promise<RefreshToken>{
    const hashedToken=hashRefreshToken(token)
    let result =await findRefreshToken(hashedToken)
    if(result===undefined){
        throw new UnauthorizedError();
    }
    return result;
}


export async function revokeToken(token:string):Promise<void>{
    const hashedToken=hashRefreshToken(token)
    await revoke(hashedToken)
}

export async function removeToken(token:string):Promise<void>{
    const hashedToken=hashRefreshToken(token)
    await remove(hashedToken)
}


