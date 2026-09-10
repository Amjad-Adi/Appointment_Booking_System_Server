import {
    createOrganization, getNumberOfOrganizations,
    getOrganization,
    getOrganizations, getUserOrganization,
    updateOrganization,
    updateOrganizationByAdmin
} from "../services/organization.service.js"
import {type Request, type Response} from "express";
import {
    CreateOrganization,
    Organization,
    OrganizationResponse, QueryOrganization,
    UpdateOrganization,
    UpdateOrganizationByAdmin
} from "../models/organization.model.js";
import {} from "../utils/Request.js"
import {QueryResponse} from "../models/query.model";

export async function handleGetOrganizations(req: Request, res: Response) {
    const query: QueryOrganization = req.validatedQuery as unknown as QueryOrganization;
    query.offset = (query.page - 1) * query.limit;
    const [organizations, totalOrganizations] = await Promise.all([getOrganizations(query), getNumberOfOrganizations(query),]);
    const baseUrl = req.originalUrl?.split('?')[0];
    const responseResult: QueryResponse =new QueryResponse(organizations, totalOrganizations, baseUrl, query.page, query.limit,);
    return res.status(200).json(responseResult);
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