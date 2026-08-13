import http from "http";
import { app } from "./app";
import {cert, initializeApp as initializeAppServer, type ServiceAccount} from "firebase-admin/app";
import serviceAccount from "./config/service-account-key.json";
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

