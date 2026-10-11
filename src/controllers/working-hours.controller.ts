import {getWorkingHours, getWorkingHour, updateWorkingHours, getNumberOfWorkingHours, updateOrganizationWorkingHours, } from "../services/working-hours.services";
import {type Request, type Response,} from "express";
import type { QueryWorkingHours, UpdateDayWorkingHours, UpdateWorkingHours, WorkingHours, WorkingHoursResponse, } from "../models/working-hours.model";
import {QueryResponse,} from "../models/query.model";
import { QuerySpecialDay } from '../models/special-days.model';

export async function handleGetOrganizationWorkingHours(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QueryWorkingHours;
    query.offset = (query.page - 1) * query.limit;
    const organizationUuid = req.user?.organizationUuid??req.params.organizationUuid as string;
    if (organizationUuid != null) {
        query.filter = {
            ...query.filter,
            organizationUuid,
        };
    }
    query.offset = (query.page - 1) * query.limit;
    const [workingHours, totalNumberOfWorkingHours] = await Promise.all([getWorkingHours(query), getNumberOfWorkingHours(query)]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new QueryResponse(workingHours, totalNumberOfWorkingHours, baseUrl, query.page, query.limit,);
    return res.status(200).json(responseResult);
}

export async function handleGetOrganizationWorkingHour(req: Request, res: Response){
    const workingHoursUuid = req.params.workingHoursUuid as string;
    const organizationUuid = req.params.organizationUuid as string;
    const result: WorkingHoursResponse = await getWorkingHour(workingHoursUuid, organizationUuid);
    return res.status(200).json(result);
}

export async function handleUpdateOrganizationDayWorkingHours(req: Request, res: Response) {
    const workingHours = req.body as UpdateDayWorkingHours;
    workingHours.uuid = req.params.workingHoursUuid as string;
    workingHours.organizationUuid = req.params.organizationUuid as string;
    workingHours.userUuid = req.user?.uuid as string;
    const result: WorkingHours = await updateWorkingHours(workingHours);
    return res.status(200).json(result);
}

export async function handleUpdateOrganizationWorkingHours(req: Request, res: Response){
    const organizationUuid = req.params.organizationUuid as string;
    const userUuid = req.user?.uuid as string;
    const workingHours = req.body as UpdateWorkingHours;
    workingHours.userUuid = userUuid;
    workingHours.organizationUuid = organizationUuid;
    const result = await updateOrganizationWorkingHours(workingHours);
    return res.status(200).json(result);
}