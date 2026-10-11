import { type Request, type Response } from 'express';
import {
    createTimeBlock,
    getNumberOfTimeBlocks,
    getTimeBlock,
    getTimeBlocks,
    updateTimeBlock,
} from '../services/time-block.service';
import {
    CreateTimeBlock, CreateTimeBlockByCrm,
    QueryTimeBlock,
    TimeBlock,
    TimeBlockResponse,
    UpdateTimeBlock,
} from '../models/time-block.model';
import { QueryResponse } from '../models/query.model';
import { Role } from '../models/enums/roles';

export async function handleGetOrganizationTimeBlocks(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as QueryTimeBlock;
    query.offset = (query.page - 1) * query.limit;
    const organizationUuid = req.user?.organizationUuid as string;
    const role=req.user?.role as Role
    query.filter = {
        ...query.filter,
        organizationUuid,
    }
    if(role==Role.WORKER)
        query.filter.requestUserUuid=req.user?.uuid as string;
    const [timeBlocks, totalTimeBlocks] = await Promise.all([getTimeBlocks(query), getNumberOfTimeBlocks(query)]);
    const baseUrl = req.originalUrl?.split("?")[0];
    const responseResult = new QueryResponse(timeBlocks, totalTimeBlocks, baseUrl, query.page, query.limit)
    return res.status(200).json(responseResult);
}

export async function handleGetOrganizationTimeBlock(req: Request, res: Response) {
    const organizationUuid = req.params.organizationUuid as string;
    const timeBlockUuid = req.params.timeBlockUuid as string;
    const userUuid = req.user?.uuid as string;
    const result: TimeBlockResponse = await getTimeBlock(timeBlockUuid, organizationUuid, userUuid);
    return res.status(200).json(result);
}

export async function handleCreateOrganizationTimeBlock(req: Request, res: Response) {
    const organizationUuid = req.params.organizationUuid as string;
    const currentUserUuid = req.user?.uuid as string;
    let timeBlock: CreateTimeBlock;
    if (req.user?.role === Role.CRM) {
        const timeBlockBody: CreateTimeBlockByCrm = req.body;
        timeBlock = {
            ...timeBlockBody,
            organizationUuid,
            requestUserUuid: timeBlockBody.requestUserUuid,
        };
    } else {
        const timeBlockBody: CreateTimeBlock = req.body;
        timeBlock = {
            ...timeBlockBody,
            organizationUuid,
            requestUserUuid: currentUserUuid,
        };
    }
    const result = await createTimeBlock(timeBlock);
    return res.status(201).json(result);
}

export async function handleUpdateOrganizationTimeBlock(req: Request, res: Response) {
    const timeBlock: UpdateTimeBlock = req.body;
    timeBlock.uuid = req.params.timeBlockUuid as string;
    timeBlock.organizationUuid = req.params.organizationUuid as string;
    timeBlock.respondUserUuid = req.user?.uuid as string;
    const result: TimeBlock = await updateTimeBlock(timeBlock);
    return res.status(200).json(result);
}