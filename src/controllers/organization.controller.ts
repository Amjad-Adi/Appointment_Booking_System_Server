import {
    createOrganization, createOrganizationByAdmin, getNumberOfOrganizations,
    getOrganization,
    getOrganizations, updateOrganization,
    updateOrganizationByAdmin
} from "../services/organization.service"
import {type Request, type Response} from "express";
import {
    CreateOrganization, CreateOrganizationByAdmin,
    Organization,
    OrganizationResponse, QueryOrganization,
    UpdateOrganizationByUser, UpdateOrganizationByAdmin,
} from "../models/organization.model";
import {QueryResponse} from "../models/query.model";
import {Role} from "../models/enums/roles";
import {
    deleteFromCloudinary, uploadToCloudinary } from '../services/cloudinary-service';
import { verifyOrganizationOwnership } from '../middlewares/authorization/authorization';
import { UploadApiResponse } from 'cloudinary';
import { getServicePictureIdByUuid } from '../services/service.service';

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
    const organizationUuid=req.user?.organizationUuid;
    let result:OrganizationResponse
    if(organizationUuid!==null){
        result=await getOrganization(organizationUuid as string)
    }
    else{
        result=await getOrganization(uuid)
    }
    return res.status(200).json(result)
}

export async function handleCreateOrganization(req:Request,res:Response) {
    let result: Organization;
    if (req.user?.role === Role.SUPER_ADMIN) {
        const organization: CreateOrganizationByAdmin = req.body;
        result = await createOrganizationByAdmin(organization);
    } else {
        const organization: CreateOrganization = {
            ...req.body,
            organizationOwnerUuid: req.user?.uuid,
        };
        const file=req?.file
        let uploadedImage:UploadApiResponse|undefined;
        if(file){
            uploadedImage=await uploadToCloudinary(file.buffer)
            organization.profilePicturePath=uploadedImage?.secure_url
            organization.profilePictureId=uploadedImage?.public_id
        }
        try{
            result = await createOrganization(organization);
            return res.status(201).json(result);
        }catch(err){
            if(uploadedImage){
                await deleteFromCloudinary(uploadedImage.public_id);
            }
            throw err;
        }
    }
    return res.status(201).json(result);
}

export async function handleUpdateOrganization(req: Request, res: Response,) {
    let result: Organization;
    if (req.user?.role === Role.SUPER_ADMIN) {
        const organization: UpdateOrganizationByAdmin ={ ...req.body, uuid: req.params.organizationUuid as string };
        result = await updateOrganizationByAdmin(organization);
        return res.status(200).json(result);
    }
    else {
        const organization: UpdateOrganizationByUser = { ...req.body, uuid:req.params.organizationUuid as string};
        let previousPictureId: string|undefined;
        let uploadedImage:UploadApiResponse|undefined;
        const file=req?.file
        await verifyOrganizationOwnership(organization.userUuid, organization.uuid)
        if(file){
            previousPictureId=await getServicePictureIdByUuid(organization.uuid)
            uploadedImage=await uploadToCloudinary(file.buffer)
            organization.profilePicturePath=uploadedImage.secure_url
            organization.profilePictureId=uploadedImage.public_id
        }
        try{
            const result: Organization = await updateOrganization(organization);
            if(file&&previousPictureId){
                await deleteFromCloudinary(previousPictureId)
            }
            return res.status(200).json(result);
        }catch(err){
            if(uploadedImage){
                await deleteFromCloudinary(uploadedImage.public_id);
            }
            throw err;
        }
    }
}