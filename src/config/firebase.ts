import {
    cert,
    initializeApp as initializeAppServer,
    type ServiceAccount,
} from "firebase-admin/app";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import serviceAccount from "../../config/service-account-key.json";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(firebaseApp);

initializeAppServer({
    credential: cert(serviceAccount as ServiceAccount),
});
