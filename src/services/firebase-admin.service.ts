import { getAuth } from "firebase-admin/auth";
import {mapFirebaseError} from "../middlewares/map-firebase-error.js";

export async function createFireBaseUser(email:string,password:string) {
    try{
    return await getAuth().createUser({
        email: email,
        emailVerified: true,
        password: password
    })}catch(e) {
        mapFirebaseError(e)
    }
}
export async function updateFireBaseUser(uid:string,password:string) {
    try {
        return await getAuth().updateUser(uid, {password: password})
    }catch(e) {
        mapFirebaseError(e)
    }
}

export async function revokeUserSessions(uid: string) {
    try {
        return await getAuth().revokeRefreshTokens(uid);
    }catch(e) {
        mapFirebaseError(e)
    }
}
