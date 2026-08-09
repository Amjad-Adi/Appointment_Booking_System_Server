import {getOrganization,getOrganizations,updateOrganization,updateOrganizationByAdmin,createOrganization} from "../services/backend/organization.service"
import { type Request, type Response } from "express";
import {CreateUser,UserResponse,UpdateUserByAdmin,UpdateUser} from "../models/user.model";
import {CreateLocation} from "../models/location.model";
import {
    CreateOrganization, Organization,
    OrganizationResponse,
    UpdateOrganization,
    UpdateOrganizationByAdmin
} from "../models/organization.model";
export async function handleGetOrganizations(req:Request,res:Response){
    const result:OrganizationResponse[]=await getOrganizations()
    return res.status(200).json(result)
}

export async function handleGetOrganization(req:Request,res:Response){
    let uuid:string=(req.params.uuid) as any as string;
    const result:OrganizationResponse=await getOrganization(uuid)
    return res.status(200).json(result)
}

export async function handleCreateOrganization(req:Request,res:Response){
    let organization:CreateOrganization=(req.body)
    const result:Organization=await createOrganization(organization)
    return res.status(201).json(result)
}

export async function handleUpdateOrganization(req:Request,res:Response){
    let organization:UpdateOrganization=(req.body)
    let uuid:string=(req.params.uuid) as any as string;
    const result:Organization=await updateOrganization(organization)
    return res.status(200).json(result)
}

export async function handleUpdateOrganizationByAdmin(req:Request, res:Response){
    let organization:UpdateOrganizationByAdmin=(req.body)
    let uuid:string=(req.params.uuid) as any as string;
    const result:Organization=await updateOrganizationByAdmin(organization)
    return res.status(200).json(result)
}