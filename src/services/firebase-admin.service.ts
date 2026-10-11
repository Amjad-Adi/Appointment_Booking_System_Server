import { getAuth } from "firebase-admin/auth";
import {mapFirebaseError} from "../utils/map/map-firebase-error";

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

export async function deleteFireBaseUser(uid:string) {
    try {
        return await getAuth().deleteUser(uid);
    }catch(e) {
        mapFirebaseError(e)
    }
}

