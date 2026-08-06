import { getAuth } from "firebase-admin/auth";
export async function createFireBaseUser(email:string,password:string) {
    return await getAuth().createUser({
        email: email,
        emailVerified: true,
        password: password
    })
}
export async function updateFireBaseUser(uid:string,email:string,password:string) {
    return await getAuth().updateUser(uid, {
        email: email,
        emailVerified: true,
        password: password
    })
}

export async function revokeUserSessions(uid: string) {
    return await getAuth().revokeRefreshTokens(uid);
}