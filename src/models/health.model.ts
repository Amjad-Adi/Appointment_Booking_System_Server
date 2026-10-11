export interface ServiceHealthCheck {
    status: "healthy"|"unhealthy"
    responseTimeInMs:number
}