import {
    getService,
    getServices,
    createService,
    updateService,
} from "../services/backend/service.service"
import { type Request, type Response } from "express";
import {CreateService, Service, ServiceResponse, UpdateService} from "../models/service.model";
export async function handleGetServices(req:Request,res:Response){
    const result:ServiceResponse[]=await getServices()
    return res.status(200).json(result)
}

export async function handleGetService(req:Request,res:Response){
    let uuid:string=(req.params.uuid) as any as string;
    const result:ServiceResponse=await getService(uuid)
    return res.status(200).json(result)
}

export async function handleCreateService(req:Request,res:Response){
    let service:CreateService=(req.body)
    const result:Service=await createService(service)
    return res.status(201).json(result)
}

export async function handleUpdateService(req:Request,res:Response){
    let service:UpdateService=(req.body)
    const result:Service=await updateService(service)
    return res.status(200).json(result)
}
