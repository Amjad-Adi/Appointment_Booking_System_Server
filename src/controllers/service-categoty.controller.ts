import {
    getServiceCategories,
    getServiceCategory,
    createServiceCategory,
    updateServiceCategory,
    getNumberOfServiceCategories,
} from "../services/service-category.service";

import { type Request, type Response } from "express";

import {
    CreateServiceCategory,
    QueryServiceCategory,
    ServiceCategory,
    UpdateServiceCategory,
} from "../models/service-category.model";

import { QueryResponse } from "../models/query.model";
import { UploadApiResponse } from 'cloudinary';
import { deleteFromCloudinary, uploadToCloudinary } from '../services/cloudinary-service';
import { getServicePictureIdByUuid } from '../services/service.service';

export async function handleGetServiceCategories(req: Request, res: Response) {
    const query: QueryServiceCategory = req.validatedQuery as unknown as QueryServiceCategory;
    const [categories, totalCategories] = await Promise.all([
        getServiceCategories(query),
        getNumberOfServiceCategories(query),
    ]);
    query.offset = (query.page - 1) * query.limit;
    const baseUrl = req.originalUrl.split("?")[0];
    const responseResult = new QueryResponse(categories, totalCategories, baseUrl, query.page, query.limit);
    return res.status(200).json(responseResult);
}

export async function handleGetServiceCategory(req: Request, res: Response) {
    const categoryUuid = req.params.categoryUuid as string;
    const result: ServiceCategory = await getServiceCategory(categoryUuid);
    return res.status(200).json(result);
}

export async function handleCreateServiceCategory(req: Request, res: Response) {
    const category: CreateServiceCategory = req.body;
    const file=req?.file
    let uploadedImage:UploadApiResponse|undefined
    if(file){
        uploadedImage=await uploadToCloudinary(file.buffer)
        category.picturePath=uploadedImage?.secure_url
        category.picturePathId=uploadedImage?.public_id
    }
    try{
        const result: ServiceCategory = await createServiceCategory(category);
        return res.status(201).json(result);
    }catch(err){
        if(uploadedImage){
            await deleteFromCloudinary(uploadedImage.public_id);
        }
        throw err;
    }
}

export async function handleUpdateServiceCategory(req: Request, res: Response) {
    const category: UpdateServiceCategory = req.body;
    const file=req?.file
    category.uuid = req.params.categoryUuid as string;
    let previousPictureId: string|undefined;
    let uploadedImage:UploadApiResponse|undefined;
    if(file){
        previousPictureId=await getServicePictureIdByUuid(category.uuid)
        uploadedImage=await uploadToCloudinary(file.buffer)
        category.picturePath=uploadedImage.secure_url
        category.picturePathId=uploadedImage.public_id
    }
    try{
        const result: ServiceCategory = await updateServiceCategory(category);
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