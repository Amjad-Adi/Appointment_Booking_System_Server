import { HealthStatus } from './enums/health-status';

export interface ServiceHealthCheck {
    status: HealthStatus
    responseTimeInMs:number
}