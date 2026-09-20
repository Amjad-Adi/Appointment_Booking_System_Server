import type {
    Request,
    Response,
} from "express";

import {
    getSpecialDay,
    getSpecialDays,
    getNumberOfSpecialDays,
    createSpecialDay,
    updateSpecialDay,
} from "../services/special-days.service.js";

import type {
    CreateSpecialDay,
    QuerySpecialDay,
    SpecialDay,
    UpdateSpecialDay,
} from "../models/special-days.model.js";

import { QueryResponse } from "../models/query.model.js";

export async function handleGetOrganizationSpecialDays(
    req: Request,
    res: Response,
) {
    const query =
        req.validatedQuery as unknown as QuerySpecialDay;

    query.offset =
        (query.page - 1) * query.limit;

    const organizationUuid =
        req.user?.organizationUuid;

    if (organizationUuid != null) {
        query.filter = {
            ...query.filter,
            organizationUuid,
        };
    }

    const [
        specialDays,
        totalSpecialDays,
    ] = await Promise.all([
        getSpecialDays(query),
        getNumberOfSpecialDays(query),
    ]);

    const baseUrl =
        req.originalUrl?.split("?")[0];

    const responseResult = new QueryResponse(
        specialDays,
        totalSpecialDays,
        baseUrl,
        query.page,
        query.limit,
    );

    return res
        .status(200)
        .json(responseResult);
}

export async function handleGetOrganizationSpecialDay(
    req: Request,
    res: Response,
) {
    const specialDayUuid =
        req.params.specialDayUuid as string;

    const organizationUuid =
        req.params.organizationUuid as string;

    const userUuid =
        req.user?.uuid as string;

    const result: SpecialDay =
        await getSpecialDay(
            specialDayUuid,
            organizationUuid,
            userUuid,
        );

    return res
        .status(200)
        .json(result);
}

export async function handleCreateOrganizationSpecialDay(
    req: Request,
    res: Response,
) {
    const specialDay =
        req.body as CreateSpecialDay;

    specialDay.organizationUuid =
        req.params.organizationUuid as string;

    specialDay.userUuid =
        req.user?.uuid as string;

    const result: SpecialDay =
        await createSpecialDay(
            specialDay,
        );

    return res
        .status(201)
        .json(result);
}

export async function handleUpdateOrganizationSpecialDay(
    req: Request,
    res: Response,
) {
    const specialDay =
        req.body as UpdateSpecialDay;

    specialDay.uuid =
        req.params.specialDayUuid as string;

    specialDay.organizationUuid =
        req.params.organizationUuid as string;

    specialDay.userUuid =
        req.user?.uuid as string;

    const result: SpecialDay =
        await updateSpecialDay(
            specialDay,
        );

    return res
        .status(200)
        .json(result);
}