import {
    getService,
    getServices,
    createService,
    updateService,
} from "../services/backend/service.service"
import { type Request, type Response } from "express";
import {CreateService, Service, PublicServiceResponse, UpdateService} from "../models/service.model";
import {getIdByUuid, getUserOrganization} from "../services/backend/organization.service";
import {findIdByUuid} from "../repositories/organizaiton.repository";
export async function handleGetOrganizationServices(req:Request,res:Response){
    let organizationUuid:string=req.params.organizationUuid  as string;
    const result:PublicServiceResponse[]=await getServices(organizationUuid)
    return res.status(200).json(result)
}

export async function handleGetOrganizationService(req:Request,res:Response){
    let serviceUuid:string=req.params.serviceUuid as string;
    let organizationUuid:string=req.params.organizationUuid  as string;
    const result:PublicServiceResponse=await getService(organizationUuid,serviceUuid)
    return res.status(200).json(result)
}

export async function handleCreateOrganizationService(req:Request,res:Response){
    let service:CreateService=(req.body)
    service.organizationUuid=req.params.organizationUuid as string;
    const result:Service=await createService(service)
    return res.status(201).json(result)
}

export async function handleUpdateOrganizationService(req:Request,res:Response){
    let service:UpdateService=(req.body)
    service.uuid=req.params.serviceUuid as string
    const result:Service=await updateService(service)
    return res.status(200).json(result)
}
