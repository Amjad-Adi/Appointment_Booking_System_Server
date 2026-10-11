import { drizzleConnection } from '../databases/drizzle-connection';
import { sql } from 'drizzle-orm';
import { ServiceHealthCheck } from '../models/health.model';
import cloudinary from '../config/cloudinary';
import { transporter } from '../config/nodemailer';
import { firebaseAdminApp } from '../config/firebase';
import { getAuth } from 'firebase-admin/auth';

export async function nodeHealthCheck():Promise<ServiceHealthCheck> {
    const startTime=Date.now();
    return {
        status:"healthy",
        responseTimeInMs:Date.now()-startTime,
    } as ServiceHealthCheck
}

export async function postgresHealthCheck():Promise<ServiceHealthCheck>{
    const startTime=Date.now();
    try{
        await drizzleConnection.execute(sql`SELECT 1`)
        return {
            status:"healthy",
            responseTimeInMs:Date.now()-startTime,
        } as ServiceHealthCheck
    }catch(e){
        return {
            status:"unhealthy",
            responseTimeInMs:Date.now()-startTime,
        } as ServiceHealthCheck
    }
}

export async function cloudinaryHealthCheck():Promise<ServiceHealthCheck>{
    const startTime=Date.now();
    try{
        await cloudinary.api.ping();
        return {
            status:"healthy",
            responseTimeInMs:Date.now()-startTime,
        } as ServiceHealthCheck
    }catch(e){
        return {
            status:"unhealthy",
            responseTimeInMs:Date.now()-startTime,
        } as ServiceHealthCheck
    }
}

export async function nodemailerHealthCheck():Promise<ServiceHealthCheck>{
    const startTime=Date.now();
    try{
        await transporter.verify();
        return {
            status:"healthy",
            responseTimeInMs:Date.now()-startTime,
        } as ServiceHealthCheck
    }catch(e){
        return {
            status:"unhealthy",
            responseTimeInMs:Date.now()-startTime,
        } as ServiceHealthCheck
    }
}

export async function firebaseHealthCheck():Promise<ServiceHealthCheck>{
    const startTime=Date.now();
    try{
        await getAuth(firebaseAdminApp).listUsers(1);
        return {
            status:"healthy",
            responseTimeInMs:Date.now()-startTime,
        } as ServiceHealthCheck
    }catch(e){
        return {
            status:"unhealthy",
            responseTimeInMs:Date.now()-startTime,
        } as ServiceHealthCheck
    }
}