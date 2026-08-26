import {
    type Auth,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    getAuth,isSignInWithEmailLink, signInWithEmailLink
} from "firebase/auth";
import {mapFirebaseError} from "../../server/middlewares/map-firebase-error";
import {CreateUser} from "../../server/models/user.model";
import {UserRecord} from "firebase-admin/auth";
import {mainRouter} from "../../server/routes/main-router.route";
import firebase from "firebase/compat/app";
import UserCredential = firebase.auth.UserCredential;
import {string} from "zod";

export async function createUserByFireBase( email: string, password: string){
    const result=await createUserWithEmailAndPassword(getAuth(),email, password);
    sendEmailVerification(result.user)
    const token=await result.user.getIdToken();
    // await app.post("api/users/register", {
    //     token,
    //     firstName,
    //     lastName,
    //     role: "CUSTOMER"
    // });
}
export async function fireBaseLogIn(auth:Auth,email:string,password:string) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return  result.user.uid;
    }catch(e) {
        mapFirebaseError(e)
    }
}

export async function logOut(auth:Auth) {
    try {
        const result = await signOut(auth);
    }catch(e) {
        mapFirebaseError(e)
    }
}

export async function invitationReceive(auth:Auth,email:string,signInLink:string) {
    if(isSignInWithEmailLink(auth,signInLink)){
        const result= await signInWithEmailLink(auth,email,signInLink);
        return result.user.uid;
    }
}