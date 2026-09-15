import type { Request, Response } from "express";

import {
    getTimeBlocks,
    getTimeBlock,
    createTimeBlock,
    updateTimeBlock,
    getNumberOfTimeBlocks,
} from "../services/time-block.service.js";

import {
    CreateTimeBlock,
    QueryTimeBlock,
    TimeBlock,
    TimeBlockResponse,
    UpdateTimeBlock,
} from "../models/time-block.model";

import { QueryResponse } from "../models/query.model.js";
import {findIdByUuid} from "../repositories/organizaiton.repository";

export async function handleGetOrganizationTimeBlocks(
    req: Request,
    res: Response,
) {

    const query =
        req.validatedQuery as unknown as QueryTimeBlock;

    query.offset =
        (query.page - 1) * query.limit;

    const organizationUuid = req.user?.organizationUuid;

    if (organizationUuid != null) {
        query.filter = {
            ...query.filter,
            organizationUuid,
        };
    }

    const [timeBlocks, totalTimeBlocks] = await Promise.all([
        getTimeBlocks(query),
        getNumberOfTimeBlocks(query),
    ]);

    const totalNumberOfTimeBlocks =
        await getNumberOfTimeBlocks(query);

    const baseUrl =
        req.originalUrl?.split("?")[0];

    const responseResult = new QueryResponse(
        timeBlocks,
        totalNumberOfTimeBlocks,
        baseUrl,
        query.page,
        query.limit,
    );

    return res.status(200).json(responseResult);
}

export async function handleGetOrganizationTimeBlock(
    req: Request,
    res: Response,
) {
    const organizationUuid =
        req.params.organizationUuid as string;

    const timeBlockUuid =
        req.params.timeBlockUuid as string;

    const userUuid =
        req.user?.uuid as string;

    const result: TimeBlockResponse =
        await getTimeBlock(
            timeBlockUuid,
            organizationUuid,
            userUuid,
        );

    return res.status(200).json(result);
}

export async function handleCreateOrganizationTimeBlock(
    req: Request,
    res: Response,
) {
    const timeBlock =
        req.body as CreateTimeBlock;

    timeBlock.organizationUuid =
        req.params.organizationUuid as string;

    timeBlock.requestUserUuid =
        req.user?.uuid as string;

    const result: TimeBlock =
        await createTimeBlock(timeBlock);

    return res.status(201).json(result);
}

export async function handleUpdateOrganizationTimeBlock(
    req: Request,
    res: Response,
) {
    const timeBlock =
        req.body as UpdateTimeBlock;

    timeBlock.uuid =
        req.params.timeBlockUuid as string;

    timeBlock.organizationUuid =
        req.params.organizationUuid as string;

    timeBlock.respondUserUuid =
        req.user?.uuid as string;

    const result: TimeBlock =
        await updateTimeBlock(timeBlock);

    return res.status(200).json(result);
}