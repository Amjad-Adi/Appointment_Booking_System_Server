import {
    type Auth,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    getAuth
} from "firebase/auth";
import {mapFirebaseError} from "../../middlewares/map-firebase-error";
import {CreateUser} from "../../models/user.model";
import {UserRecord} from "firebase-admin/auth";
import {mainRouter} from "../../routes/main-router.route";
import firebase from "firebase/compat/app";
import UserCredential = firebase.auth.UserCredential;

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
        return await result.user.uid;
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