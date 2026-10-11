import { nodeHealthCheck ,firebaseHealthCheck,nodemailerHealthCheck, cloudinaryHealthCheck,postgresHealthCheck} from '../services/health.service';
import {type Request, type Response} from "express";

export async function healthCheck(req: Request, res: Response) {
    const startTime=Date.now()
    const [node,database,cloudinary, firebase, nodemailer]=await Promise.all([nodeHealthCheck(),postgresHealthCheck(),cloudinaryHealthCheck(),firebaseHealthCheck(),nodemailerHealthCheck()])
    const checks={node,database,cloudinary, firebase, nodemailer}
    const isHealthy = Object.values(checks).every(
        check => check.status === "healthy"
    );
    return res.status(isHealthy?200:503).json({
        status: isHealthy ? "healthy" : "unhealthy",
        uptime_seconds: process.uptime(),
        timestamp: new Date().toISOString(),
        response_time_ms: Date.now() - startTime,
        checks
    });
}