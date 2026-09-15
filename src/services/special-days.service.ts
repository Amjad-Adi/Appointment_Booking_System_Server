import {
    findAll,
    findByUuid,
    findByDate,
    create,
    update,
    countAll,
} from "../repositories/special-days.repository.js";

import {
    AuthorizeOrganizationUser,
    getUserIdByUuid,
} from "./user.service.js";

import {
    findIdByUuid,
} from "../repositories/organizaiton.repository.js";

import {
    NotFoundError,
} from "../errors/not-found.error.js";

import {
    BadRequestError,
} from "../errors/bad-request.error.js";

import type {
    CreateSpecialDay,
    QuerySpecialDay,
    SpecialDay,
    UpdateSpecialDay,
} from "../models/special-days.model.js";

export async function getSpecialDays(
    query: QuerySpecialDay,
): Promise<SpecialDay[]> {
    const organizationUuid =
        query.filter?.organizationUuid;

    if (organizationUuid === undefined) {
        throw new NotFoundError("Organization");
    }

    const organizationId =
        await findIdByUuid(organizationUuid);

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    query.organizationId = organizationId;

    return await findAll(query);
}

export async function getNumberOfSpecialDays(
    query: QuerySpecialDay,
): Promise<number> {
    const organizationUuid =
        query.filter?.organizationUuid;

    if (organizationUuid === undefined) {
        throw new NotFoundError("Organization");
    }

    const organizationId =
        await findIdByUuid(organizationUuid);

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    query.organizationId = organizationId;

    return await countAll(query);
}

export async function getSpecialDay(
    specialDayUuid: string,
    organizationUuid: string,
    userUuid: string,
): Promise<SpecialDay> {
    await AuthorizeOrganizationUser(
        userUuid,
        organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    const result =
        await findByUuid(
            organizationId,
            specialDayUuid,
        );

    if (result === undefined) {
        throw new NotFoundError("Special Day");
    }

    return result;
}

export async function createSpecialDay(
    specialDay: CreateSpecialDay,
): Promise<SpecialDay> {
    await AuthorizeOrganizationUser(
        specialDay.userUuid,
        specialDay.organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            specialDay.organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    const userId =
        await getUserIdByUuid(
            specialDay.userUuid,
        );

    if (userId === undefined) {
        throw new NotFoundError("User");
    }

    const result = await create({
        ...specialDay,
        organizationId,
        userUuid: specialDay.userUuid,
    });

    if (result === undefined) {
        throw new BadRequestError();
    }

    return result;
}

export async function updateSpecialDay(
    specialDay: UpdateSpecialDay,
): Promise<SpecialDay> {
    await AuthorizeOrganizationUser(
        specialDay.userUuid,
        specialDay.organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            specialDay.organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    const result = await update(
        specialDay,
        organizationId,
    );

    if (result === undefined) {
        throw new NotFoundError("Special Day");
    }

    return result;
}

export async function isTodaySpecialDay(
    organizationUuid: string,
    userUuid: string,
): Promise<SpecialDay | undefined> {
    await AuthorizeOrganizationUser(
        userUuid,
        organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);

    return await findByDate(
        organizationId,
        today,
    );
}