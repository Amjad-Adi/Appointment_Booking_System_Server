import {
    cert,
    getApps,
    initializeApp,
    type ServiceAccount,
} from "firebase-admin/app";
import fs from "fs";
import path from "path";

const serviceAccountPath =
    process.env.NODE_ENV === "production"
        ? "/etc/secrets/service-account-key.json"
        : path.resolve(process.cwd(), "config/service-account-key.json");

if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
        `Firebase service account file not found: ${serviceAccountPath}`,
    );
}

const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf-8"),
) as ServiceAccount;

const firebaseAdminApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert(serviceAccount),
        });

export default firebaseAdminApp;