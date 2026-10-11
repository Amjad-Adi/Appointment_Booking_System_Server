import fs from "fs";
import path from "path";
import { cert, getApps, initializeApp, ServiceAccount } from 'firebase-admin';

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

export const firebaseAdminApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert(serviceAccount),
        });