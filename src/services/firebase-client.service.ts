import {
    type Auth,
    createUserWithEmailAndPassword,
    isSignInWithEmailLink,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signInWithEmailLink,
    signOut,
} from "firebase/auth";

import { mapFirebaseError } from "../middlewares/map-firebase-error";

export async function createUserByFireBase(
    auth: Auth,
    email: string,
    password: string,
) {
    try {
        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
        );

        await sendEmailVerification(result.user);

        return await result.user.getIdToken();
    } catch (e) {
        mapFirebaseError(e);
    }
}

export async function fireBaseLogIn(
    auth: Auth,
    email: string,
    password: string,
) {
    try {
        const result = await signInWithEmailAndPassword(
            auth,
            email,
            password,
        );

        return result.user.uid;
    } catch (e) {
        mapFirebaseError(e);
    }
}

export async function logOut(auth: Auth) {
    try {
        await signOut(auth);
    } catch (e) {
        mapFirebaseError(e);
    }
}

export async function invitationReceive(
    auth: Auth,
    email: string,
    signInLink: string,
) {
    try {
        if (!isSignInWithEmailLink(auth, signInLink)) {
            return undefined;
        }

        const result = await signInWithEmailLink(
            auth,
            email,
            signInLink,
        );

        return result.user.uid;
    } catch (e) {
        mapFirebaseError(e);
    }
}
