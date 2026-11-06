import type { Request, Response, } from 'express';
import { QueryResponse } from '../models/query.model';
import { CreateSpecialDay, QuerySpecialDay, SpecialDay, UpdateSpecialDay } from '../models/special-days.model';
import {
    createSpecialDay,
    getNumberOfSpecialDays,
    getSpecialDay,
    getSpecialDays,
    updateSpecialDay
} from '../services/special-days.service';
import { Role } from '../models/enums/roles';
import { ActivationStatus } from '../models/enums/activation-status';
import { NotFoundError } from '../errors/not-found.error';
import { verifyOrganizationReadAccess, verifyOrganizationOwnership } from '../middlewares/authorization/authorization';

export async function handleGetOrganizationSpecialDays(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QuerySpecialDay;
    const organizationUuid = (req.params.organizationUuid ?? req.user?.organizationUuid) as string;
    const role=req.user?.role

    await verifyOrganizationReadAccess(req, organizationUuid);

    query.offset = (query.page - 1) * query.limit;
    query.filter = {
        ...query.filter,
        ...(organizationUuid != null && { organizationUuid }),
        ...((role === Role.WORKER || role === Role.CUSTOMER || organizationUuid == null) && {
            status: ActivationStatus.ACTIVE,
        }),
    };
    const [specialDays, totalSpecialDays,] = await Promise.all([getSpecialDays(query), getNumberOfSpecialDays(query),]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new QueryResponse(specialDays, totalSpecialDays, baseUrl, query.page, query.limit,);
    return res.status(200).json(responseResult);
}

export async function handleGetOrganizationSpecialDay(req: Request, res: Response,) {
    const specialDayUuid = req.params.specialDayUuid as string;
    const organizationUuid = (req.params.organizationUuid ?? req.user?.organizationUuid) as string;
    const role=req.user?.role
    await verifyOrganizationReadAccess(req, organizationUuid);
    const result: SpecialDay = await getSpecialDay(specialDayUuid, organizationUuid);
    if ((role === Role.WORKER || role === Role.CUSTOMER || organizationUuid == null) && result.status !== ActivationStatus.ACTIVE) {
        throw new NotFoundError('Special day not found');
    }
    return res.status(200).json(result);
}

export async function handleCreateOrganizationSpecialDay(req: Request, res: Response,) {
    const specialDay = req.body as CreateSpecialDay;
    specialDay.organizationUuid = req.params.organizationUuid as string;
    specialDay.userUuid = req.user?.uuid as string;
    await verifyOrganizationOwnership(specialDay.userUuid, specialDay.organizationUuid);
    const result: SpecialDay = await createSpecialDay(specialDay);
    return res.status(201).json(result);
}

export async function handleUpdateOrganizationSpecialDay(req: Request, res: Response,) {
    const specialDay = req.body as UpdateSpecialDay;
    specialDay.uuid = req.params.specialDayUuid as string;
    specialDay.organizationUuid = req.params.organizationUuid as string;
    specialDay.userUuid = req.user?.uuid as string;
    await verifyOrganizationOwnership(specialDay.userUuid, specialDay.organizationUuid);
    const result: SpecialDay = await updateSpecialDay(specialDay);
    return res.status(200).json(result);
}