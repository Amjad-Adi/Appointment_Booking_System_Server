"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserByFireBase = createUserByFireBase;
exports.fireBaseLogIn = fireBaseLogIn;
exports.logOut = logOut;
exports.invitationReceive = invitationReceive;
const auth_1 = require("firebase/auth");
const map_firebase_error_1 = require("../middlewares/map-firebase-error");
async function createUserByFireBase(email, password) {
    const result = await (0, auth_1.createUserWithEmailAndPassword)((0, auth_1.getAuth)(), email, password);
    (0, auth_1.sendEmailVerification)(result.user);
    const token = await result.user.getIdToken();
    // await app.post("api/users/register", {
    //     token,
    //     firstName,
    //     lastName,
    //     role: "CUSTOMER"
    // });
}
async function fireBaseLogIn(auth, email, password) {
    try {
        const result = await (0, auth_1.signInWithEmailAndPassword)(auth, email, password);
        return result.user.uid;
    }
    catch (e) {
        (0, map_firebase_error_1.mapFirebaseError)(e);
    }
}
async function logOut(auth) {
    try {
        const result = await (0, auth_1.signOut)(auth);
    }
    catch (e) {
        (0, map_firebase_error_1.mapFirebaseError)(e);
    }
}
async function invitationReceive(auth, email, signInLink) {
    if ((0, auth_1.isSignInWithEmailLink)(auth, signInLink)) {
        const result = await (0, auth_1.signInWithEmailLink)(auth, email, signInLink);
        return result.user.uid;
    }
}
