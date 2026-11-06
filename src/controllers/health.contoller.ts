import {
    cloudinaryHealthCheck,
    firebaseHealthCheck,
    nodeHealthCheck,
    nodemailerHealthCheck,
    postgresHealthCheck
} from '../services/health.service';
import { type Request, type Response } from 'express';
import { HealthStatus } from '../models/enums/health-status';

export async function healthCheck(req: Request, res: Response) {
    const startTime=Date.now()
    const [node,database,cloudinary, firebase, nodemailer]=await Promise.all([nodeHealthCheck(),postgresHealthCheck(),cloudinaryHealthCheck(),firebaseHealthCheck(),nodemailerHealthCheck()])
    const checks={node,database,cloudinary, firebase, nodemailer}
    const isHealthy = Object.values(checks).every(
        check => check.status === HealthStatus.HEALTHY
    );
    return res.status(isHealthy?200:503).json({
        status: isHealthy ? HealthStatus.HEALTHY: HealthStatus.UNHEALTHY,
        uptime_seconds: process.uptime(),
        timestamp: new Date().toISOString(),
        response_time_ms: Date.now() - startTime,
        checks
    });
}