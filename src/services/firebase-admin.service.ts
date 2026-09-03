import { getAuth } from "firebase-admin/auth";
import {mapFirebaseError} from "../middlewares/map-firebase-error.js";
import {inviteEmail} from "./smtp-nodemailer.service.js";
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

export async function inviteFireBaseUser(invitationUuid:string,organizationName:string,fromEmail:string,toEmail:string) {
    let link:string
    try{
        const actionCodeSettings={
            url:`${process.env.DEVELOPMENT_HOST}/users/me/invitations/${invitationUuid}/?email=${encodeURIComponent(toEmail)}`,
            handleCodeInApp:true
        }
        link=await getAuth().generateSignInWithEmailLink(
            toEmail,
            actionCodeSettings
        )
        }catch(e) {
        console.error(e)
        mapFirebaseError(e)
        }
        await inviteEmail(organizationName,fromEmail,toEmail, link);
}