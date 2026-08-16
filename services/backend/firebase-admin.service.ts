import { getAuth } from "firebase-admin/auth";
import {mapFirebaseError} from "../../middlewares/map-firebase-error";
export async function createFireBaseUser(email:string,password:string) {
    try{
    return await getAuth().createUser({
        email: email,
        emailVerified: true,
        password: password
    })}catch(e) {
        throw mapFirebaseError(e)
    }
}
export async function updateFireBaseUser(uid:string,password:string) {
    try {
        return await getAuth().updateUser(uid, {password: password})
    }catch(e) {
        throw mapFirebaseError(e)
    }
}

export async function revokeUserSessions(uid: string) {
    try {
        return await getAuth().revokeRefreshTokens(uid);
    }catch(e) {
        throw mapFirebaseError(e)
    }
}

export async function inviteFireBaseUser(email:string,invitationUuid:string) {
    try{
        const actionCodeSettings={
            url:process.env.DEVELOPMENT_HOS+"/me/invitations/"+invitationUuid,
            handleCodeInApp:true
        }
        return await getAuth().generateSignInWithEmailLink(
            email,
            actionCodeSettings
        )
        }catch(e) {
        throw mapFirebaseError(e)
    }
}