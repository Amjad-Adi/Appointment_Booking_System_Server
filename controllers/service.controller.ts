import {
    getService,
    getServices,
    createService,
    updateService,
} from "../services/backend/service.service"
import { type Request, type Response } from "express";
import {CreateService, Service, ServiceResponse, UpdateService} from "../models/service.model";
import {getIdByUuid, getUserOrganization} from "../services/backend/organization.service";
import {findIdByUuid} from "../repositories/organizaiton.repository";
export async function handleGetOrganizationServices(req:Request,res:Response){
    let organizationUuid:string=req.params.organizationUuid  as string;
    let organizationId= await getIdByUuid(organizationUuid)
    const result:ServiceResponse[]=await getServices(organizationId)
    return res.status(200).json(result)
}

export async function handleGetOrganizationService(req:Request,res:Response){
    let serviceUuid:string=req.params.serviceUuid as string;
    let organizationUuid:string=req.params.organizationUuid  as string;
    let organizationId=await getIdByUuid(organizationUuid)
    const result:ServiceResponse=await getService(organizationId,serviceUuid)
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
