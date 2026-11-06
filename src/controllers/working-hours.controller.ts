import {getWorkingHours, getWorkingHour, updateWorkingHours, getNumberOfWorkingHours, } from "../services/working-hours.services";
import {type Request, type Response,} from "express";
import type { QueryWorkingHours, UpdateDayWorkingHours, WorkingHours, WorkingHoursResponse, } from "../models/working-hours.model";
import {QueryResponse,} from "../models/query.model";
import { verifyOrganizationReadAccess, verifyOrganizationOwnership } from '../middlewares/authorization/authorization';

export async function handleGetOrganizationWorkingHours(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QueryWorkingHours;
    query.offset = (query.page - 1) * query.limit;
    const organizationUuid = (req.params.organizationUuid ?? req.user?.organizationUuid) as string;
    await verifyOrganizationReadAccess(req, organizationUuid);
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
    await verifyOrganizationReadAccess(req, organizationUuid);
    const result: WorkingHoursResponse = await getWorkingHour(workingHoursUuid, organizationUuid);
    return res.status(200).json(result);
}

export async function handleUpdateOrganizationDayWorkingHours(req: Request, res: Response) {
    const workingHours = req.body as UpdateDayWorkingHours;
    workingHours.uuid = req.params.workingHoursUuid as string;
    workingHours.organizationUuid = req.params.organizationUuid as string;
    workingHours.userUuid = req.user?.uuid as string;
    await verifyOrganizationOwnership(workingHours.userUuid, workingHours.organizationUuid);
    const result: WorkingHours = await updateWorkingHours(workingHours);
    return res.status(200).json(result);
}