import {
    getService,
    getServices,
    createService,
    updateService, getNumberOfServices,
} from "../services/backend/service.service"
import { type Request, type Response } from "express";
import {CreateService, QueryService, Service, ServiceResponse, UpdateService} from "../models/service.model";
import {} from "../utils/Request"
import {QueryResponse} from "../models/query.model";

export async function handleGetOrganizationServices(req:Request,res:Response){
    const query:QueryService= req.validatedQuery as unknown as QueryService;
    const organizationUuid:string=req.params.organizationUuid  as string;
    const userUuid:string=req.user.uuid as string;
    const [services,totalServices]=await Promise.all([getServices(query,organizationUuid),getNumberOfServices(query,organizationUuid)])
    query.offset=(query?.page-1)*query?.limit
    const baseUrl=req.originalUrl?.split("?")[0]
    const responseResult:QueryResponse=new QueryResponse(services,totalServices,baseUrl,query?.page,query?.limit)
    return res.status(200).json(responseResult)
}

export async function handleGetOrganizationService(req:Request,res:Response){
    const serviceUuid:string=req.params.serviceUuid as string;
    const organizationUuid:string=req.params.organizationUuid  as string;
    const result:ServiceResponse=await getService(organizationUuid,serviceUuid)
    return res.status(200).json(result)
}

export async function handleCreateOrganizationService(req:Request,res:Response){
    const service:CreateService=(req.body)
    service.organizationUuid=req.params.organizationUuid as string;
    const userUuid:string=req.user.uuid as string;
    const result:Service=await createService(service,userUuid)
    return res.status(201).json(result)
}

export async function handleUpdateOrganizationService(req:Request,res:Response){
    const service:UpdateService=(req.body)
    service.uuid=req.params.serviceUuid as string
    service.userUuid=req.user.uuid as string;
    service.organizationUuid=req.params.organizationUuid  as string;
    const result:Service=await updateService(service)
    return res.status(200).json(result)
}
