import {
    getWorkingHours,
    getWorkingHour,
    updateWorkingHours,
    getNumberOfWorkingHours, updateOrganizationWorkingHours,
} from "../services/working-hours.services";
import {type Request, type Response,} from "express";
import type {
    QueryWorkingHours, UpdateOrganizationWorkingHours,
    UpdateWorkingHours,
    WorkingHours,
    WorkingHoursResponse,
} from "../models/working-hours.model.js";
import {QueryResponse,} from "../models/query.model.js";

export async function handleGetOrganizationWorkingHours(req: Request, res: Response) {
    const routeOrganizationUuid = req.params.organizationUuid as string;
    const query = req.validatedQuery as unknown as QueryWorkingHours;
    query.filter = {
            ...query.filter,
        organizationUuid: routeOrganizationUuid,
    };
    query.offset = (query.page - 1) * query.limit;
    const [workingHours, totalNumberOfWorkingHours,] = await Promise.all([getWorkingHours(query), getNumberOfWorkingHours(query)]);
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
export async function handleUpdateOrganizationWorkingHours(req: Request, res: Response) {
    const workingHours = req.body as UpdateWorkingHours;
    workingHours.uuid = req.params.workingHoursUuid as string;
    workingHours.organizationUuid = req.params.organizationUuid as string;
    workingHours.userUuid = req.user?.uuid as string;
    const result: WorkingHours = await updateWorkingHours(workingHours);
    return res.status(200).json(result);
}

export async function handleUpdateOrganizationWorkingHoursWeek(req: Request, res: Response){
    const organizationUuid = req.params.organizationUuid as string;
    const userUuid = req.user?.uuid as string;
    const body = req.body as { days: UpdateOrganizationWorkingHours["days"]; };
    const workingHours: UpdateOrganizationWorkingHours = {
        organizationUuid,
        userUuid,
        days: body.days,
    };
    const result = await updateOrganizationWorkingHours(workingHours);
    return res.status(200).json(result);
}