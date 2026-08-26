import {
    createOrganization,
    getOrganization,
    getOrganizations, getUserOrganization,
    updateOrganization,
    updateOrganizationByAdmin
} from "../services/backend/organization.service"
import {type Request, type Response} from "express";
import {
    CreateOrganization,
    Organization,
    OrganizationResponse,
    UpdateOrganization,
    UpdateOrganizationByAdmin
} from "../models/organization.model";
import {} from "../utils/Request"
export async function handleGetOrganizations(req:Request,res:Response){
    const result:OrganizationResponse[]=await getOrganizations()
    return res.status(200).json(result)
}

export async function handleGetOrganization(req:Request,res:Response){
    const uuid:string=(req.params.organizationUuid)  as string;
    const result:OrganizationResponse=await getOrganization(uuid)
    return res.status(200).json(result)
}

export async function handleCreateOrganization(req:Request,res:Response){
    const organization:CreateOrganization=(req.body)
    organization.organizationOwnerUuid=req.user.uuid;
    const result:Organization=await createOrganization(organization)
    return res.status(201).json(result)
}

export async function handleUpdateOrganization(req:Request,res:Response){
    const organization:UpdateOrganization=(req.body)
    organization.uuid=req.params.organizationUuid as string
    const result:Organization=await updateOrganization(organization)
    return res.status(200).json(result)
}

export async function handleUpdateOrganizationByAdmin(req:Request, res:Response){
    const organization:UpdateOrganizationByAdmin=(req.body)
    organization.uuid=(req.params.organizationUuid) as string;
    const result:Organization=await updateOrganizationByAdmin(organization)
    return res.status(200).json(result)
}