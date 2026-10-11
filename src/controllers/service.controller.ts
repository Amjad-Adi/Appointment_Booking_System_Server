import { type Request, type Response } from "express";
import {
    getService,
    getServices,
    createService,
    updateService,
    getNumberOfServices, getServicePictureIdByUuid,
} from "../services/service.service";
import {
    CreateService,
    QueryService,
    Service,
    ServiceResponse,
    UpdateService,
} from "../models/service.model";
import { QueryResponse } from "../models/query.model";
import { verifyOrganizationOwnership } from '../middlewares/authorization/authorization';
import { deleteFromCloudinary, uploadToCloudinary } from '../services/cloudinary-service';
import { UploadApiResponse } from 'cloudinary';

export async function handleGetServices(req: Request, res: Response) {
    const query: QueryService = req.validatedQuery as unknown as QueryService;
    query.offset = (query.page - 1) * query.limit;
    const organizationUuid = req.user?.organizationUuid??(req.params?.organizationUuid as string);
    query.filter = {
        ...query.filter,
        organizationUuid,
    };
    const [services, totalServices] = await Promise.all([
        getServices(query),
        getNumberOfServices(query),
    ]);
    const baseUrl = req.originalUrl.split("?")[0];
    const responseResult: QueryResponse = new QueryResponse(services, totalServices, baseUrl, query.page, query.limit,)
    return res.status(200).json(responseResult);
}

export async function handleGetService(req: Request, res: Response) {
    const serviceUuid = req.params.serviceUuid as string;
    const organizationUuid = req.user?.organizationUuid??(req.params?.organizationUuid as string);
    const result: ServiceResponse = await getService(serviceUuid,organizationUuid);
    return res.status(200).json(result);
}

export async function handleCreateOrganizationService(req: Request, res: Response){
    const service: CreateService = req.body;
    service.organizationUuid = req.params.organizationUuid as string;
    const userUuid = req.user?.uuid as string;
    let uploadedImage:UploadApiResponse|undefined;
    await verifyOrganizationOwnership(userUuid,service.organizationUuid)
    try{
        const file=req?.file
        if(file){
            uploadedImage=await uploadToCloudinary(file.buffer)
            service.servicePicturePath=uploadedImage?.secure_url
            service.servicePicturePathId=uploadedImage?.public_id
        }
        const result: Service = await createService(service);
        return res.status(201).json(result);
    }catch(err){
        if(uploadedImage){
            try {
                await deleteFromCloudinary(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error("Failed to clean up uploaded service image", cleanupError);
            }
        }
        throw err;
    }
}


export async function handleUpdateOrganizationService(req: Request, res: Response) {
    const service: UpdateService = req.body;
    service.uuid = req.params.serviceUuid as string;
    service.userUuid = req.user?.uuid as string;
    service.organizationUuid = req.params.organizationUuid as string;
    let previousPictureId: string | undefined;
    let uploadedImage: UploadApiResponse | undefined;
    await verifyOrganizationOwnership(service.userUuid, service.organizationUuid);
    try {
        const file=req?.file
        if (file) {
            previousPictureId = await getServicePictureIdByUuid(service.uuid);
            uploadedImage = await uploadToCloudinary(file.buffer);
            service.servicePicturePath = uploadedImage.secure_url;
            service.servicePicturePathId = uploadedImage.public_id;
        }
        const result: Service = await updateService(service);
        if (uploadedImage && previousPictureId) {
            try {
                await deleteFromCloudinary(previousPictureId);
            } catch (cleanupError) {
                console.error("Failed to delete previous service image", cleanupError);
            }
        }
        return res.status(200).json(result);
    } catch (err) {
        if (uploadedImage) {
            try {
                await deleteFromCloudinary(uploadedImage.public_id);
            } catch (cleanupError) {
                console.error("Failed to clean up uploaded service image", cleanupError);
            }
        }
        throw err;
    }
}
