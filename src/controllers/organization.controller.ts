import {
    createOrganization, createOrganizationByAdmin, getNumberOfOrganizations,
    getOrganization,
    getOrganizations, getOrganizationPictureIdByUuid, updateOrganization,
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
import { UploadApiResponse } from 'cloudinary';
import { ActivationStatus } from '../models/enums/activation-status';
import { NotFoundError } from '../errors/not-found.error';

export async function handleGetOrganizations(req: Request, res: Response) {
    const query: QueryOrganization = req.validatedQuery as unknown as QueryOrganization;
    query.offset = (query.page - 1) * query.limit;
    const organizationUuid=req.user?.organizationUuid
    const role=req.user?.role
    query.filter = {
        ...query.filter,
        ...(organizationUuid != null && { organizationUuid }),
        ...((role !== Role.SUPER_ADMIN ) && {
            status: ActivationStatus.ACTIVE,
        }),
    };
    const [organizations, totalOrganizations] = await Promise.all([getOrganizations(query), getNumberOfOrganizations(query),]);
    const baseUrl = req.originalUrl?.split('?')[0];
    const responseResult: QueryResponse =new QueryResponse(organizations, totalOrganizations, baseUrl, query.page, query.limit,);
    return res.status(200).json(responseResult);
}

export async function handleGetOrganization(req: Request, res: Response) {
    const uuid: string = req.params.organizationUuid as string;
    const role = req.user?.role;
    const result: OrganizationResponse = await getOrganization(uuid);
    if (role !== Role.SUPER_ADMIN && result.status !== ActivationStatus.ACTIVE) {
        throw new NotFoundError('Organization not found');
    }
    return res.status(200).json(result);
}
export async function handleCreateOrganization(req:Request,res:Response) {
    let uploadedImage:UploadApiResponse|undefined;
    try{
        const file=req?.file
        if(file){
            uploadedImage=await uploadToCloudinary(file.buffer)
        }
        const pictureData = uploadedImage
            ? { profilePicturePath: uploadedImage.secure_url, profilePictureId: uploadedImage.public_id }
            : {};
        let result: Organization;
        if (req.user?.role === Role.SUPER_ADMIN) {
            const organization: CreateOrganizationByAdmin = { ...req.body, ...pictureData };
            result = await createOrganizationByAdmin(organization);
        } else {
            const organization: CreateOrganization = {
                ...req.body,
                ...pictureData,
                organizationOwnerUuid: req.user?.uuid,
            };
            result = await createOrganization(organization);
        }
        return res.status(201).json(result);
    }catch(err){
        if(uploadedImage){
            try {
                await deleteFromCloudinary(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error("Failed to clean up uploaded organization image", cleanupError);
            }
        }
        throw err;
    }
}

export async function handleUpdateOrganization(req: Request, res: Response,) {
    const organizationUuid = req.params.organizationUuid as string;
    let previousPictureId: string|undefined;
    let uploadedImage:UploadApiResponse|undefined;
    try{
        const file=req?.file
        if(file){
            previousPictureId=await getOrganizationPictureIdByUuid(organizationUuid)
            uploadedImage=await uploadToCloudinary(file.buffer)
        }
        const pictureData = uploadedImage
            ? { profilePicturePath: uploadedImage.secure_url, profilePictureId: uploadedImage.public_id }
            : {};
        let result: Organization;
        if (req.user?.role === Role.SUPER_ADMIN) {
            const organization: UpdateOrganizationByAdmin ={ ...req.body, ...pictureData, uuid: organizationUuid };
            result = await updateOrganizationByAdmin(organization);
        }
        else {
            const organization: UpdateOrganizationByUser = {
                ...req.body,
                ...pictureData,
                uuid: organizationUuid,
                userUuid: req.user?.uuid as string,
            };
            result = await updateOrganization(organization);
        }
        if(uploadedImage&&previousPictureId){
            try {
                await deleteFromCloudinary(previousPictureId)
            } catch (cleanupError) {
                console.error("Failed to delete previous organization image", cleanupError);
            }
        }
        return res.status(200).json(result);
    }catch(err){
        if(uploadedImage){
            try {
                await deleteFromCloudinary(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error("Failed to clean up uploaded organization image", cleanupError);
            }
        }
        throw err;
    }
}