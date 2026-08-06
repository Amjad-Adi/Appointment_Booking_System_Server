import { type Auth, signInWithEmailAndPassword,signOut} from "firebase/auth";//frontend

export async function logIn(auth:Auth,email:string,password:string) {
    const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );
    return await result.user.getIdToken();
}

export async function logOut(auth:Auth) {
    const result = await signOut(auth);
}