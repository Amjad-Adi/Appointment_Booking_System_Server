
export interface BlacklistedToken {
    jti:string,
    blackListedAtUTC:Date,
    expiresAtUTC:Date
    reason:string,
}


export interface CreateBlacklistedToken{
    jti:number,
    expiresAtUTC:Date
    reason:string
}