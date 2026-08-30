import {
    getSpecialDay,
    getSpecialDays,
    createSpecialDay,
    updateSpecialDay, isTodaySpecialDay,
} from "../services/special-days.service.js"
import { type Request, type Response } from "express";
import {} from "../utils/Request.js"
import {CreateSpecialDay, SpecialDay, UpdateSpecialDay} from "../models/special-days.model.js";
import {findIdByUuid} from "../repositories/user.repository.js";
import {getOrganizationIdByUuid} from "../services/organization.service.js";
export async function handleGetOrganizationSpecialDays(req:Request,res:Response){
    let organizationUuid:string=req.params.organizationUuid  as string;
    let userUuid:string=req.user.uuid as string;
    const result:SpecialDay[]=await getSpecialDays(organizationUuid)
    return res.status(200).json(result)
}

export async function handleGetOrganizationSpecialDay(req:Request,res:Response){
    let specialDayUuid:string=req.params.specialDayUuid as string;
    let organizationUuid:string=req.params.organizationUuid  as string;
    let userUuid:string=req.user.uuid as string;
    const result:SpecialDay=await getSpecialDay(specialDayUuid,organizationUuid)
    return res.status(200).json(result)
}

export async function handleCreateSpecialDay(req:Request,res:Response){
    let specialDay:CreateSpecialDay=(req.body)
    specialDay.organizationUuid=req.params.organizationUuid as string;
    specialDay.userUuid=req.user.uuid as string;
    specialDay.organizationId=await getOrganizationIdByUuid(specialDay.organizationUuid)
    const result:SpecialDay=await createSpecialDay(specialDay)
    return res.status(201).json(result)
}

export async function handleUpdateSpecialDay(req:Request,res:Response){
    let specialDay:UpdateSpecialDay=(req.body)
    specialDay.uuid=req.params.specialDay as string
    specialDay.organizationUuid=req.params.organizationUuid  as string;
    specialDay.userUuid=req.user.uuid as string;
    const result:SpecialDay=await updateSpecialDay(specialDay)
    return res.status(200).json(result)
}


export async function handleIsTodaySpecialDay(req:Request,res:Response){
    const organizationUuid=req.params.organizationUuid  as string;
    const result:SpecialDay=await isTodaySpecialDay(organizationUuid)
    return res.status(200).json(result)
}
