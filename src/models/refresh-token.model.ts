
export interface RefreshToken {
    userId:number,
    tokenHash:string
    createdAtUTC:Date,
    expiresAtUTC:Date
    revoked:boolean,
    revokedAtUTC:Date,
}


export interface CreateRefreshToken{
    userId:number,
    tokenHash:string
}