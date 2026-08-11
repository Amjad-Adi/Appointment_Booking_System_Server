import http from "http";
import { app } from "./app";
import {cert, initializeApp as initializeAppServer, type ServiceAccount} from "firebase-admin/app";
import serviceAccount from "./config/serviceAccountKey.json";
import {logIn} from "./services/frontend/firebase-client.service";
const PORT = 3000;
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyAaiVYC56TwRWruzyhtH9uWK1PbRwGIero",
    authDomain: "training1-abd2a6d3.firebaseapp.com",
    projectId: "training1-abd2a6d3",
    storageBucket: "training1-abd2a6d3.firebasestorage.app",
    messagingSenderId: "978386790249",
    appId: "1:978386790249:web:926c32a7a501d1054d7ff8",
    measurementId: "G-TMTXFKQXTZ"
};

const firebaseApp = initializeApp(firebaseConfig);
initializeAppServer({
    credential: cert(serviceAccount as ServiceAccount),
});
const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
logInAndGetTokenAsAdmin()
async function logInAndGetTokenAsAdmin(){
    const token=await logIn(getAuth(firebaseApp),process.env.FIREBASE_SUPER_ADMIN_EMAIL as string,process.env.FIREBASE_SUPER_ADMIN_PASSWORD  as string)
    console.log("\n\nAdmin Token\n\n"+token)}

logInAndGetTokenAsCustomer()
async function logInAndGetTokenAsCustomer(){
    const token=await logIn(getAuth(firebaseApp),process.env.FIREBASE_CUSTOMER_EMAIL as string,process.env.FIREBASE_CUSTOMER_PASSWORD  as string)
console.log("\n\nCustomer Token\n\n"+token)
}

logInAndGetTokenAsOwner()
async function logInAndGetTokenAsOwner(){
    const token=await logIn(getAuth(firebaseApp),process.env.FIREBASE_OWNER_EMAIL as string,process.env.FIREBASE_OWNER_PASSWORD  as string)
    console.log("\n\nOwner Token\n\n"+token)
}

