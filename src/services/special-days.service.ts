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
        await findIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    query.organizationId =
        organizationId;

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
        await findIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }

    query.organizationId =
        organizationId;

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

    /*
     * Only one special-day record should exist for an
     * organization on a particular calendar date.
     */
    const existingSpecialDay =
        await findByDate(
            organizationId,
            specialDay.dayDate,
        );

    if (existingSpecialDay !== undefined) {
        throw new BadRequestError(
            "A special day already exists for this date.",
        );
    }

    const result =
        await create({
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

    /*
     * If the date changes, don't allow the new date to
     * collide with another special-day record.
     */
    if (specialDay.dayDate !== undefined) {
        const existingSpecialDay =
            await findByDate(
                organizationId,
                specialDay.dayDate,
            );

        if (
            existingSpecialDay !== undefined &&
            existingSpecialDay.uuid !== specialDay.uuid
        ) {
            throw new BadRequestError(
                "A special day already exists for this date.",
            );
        }
    }

    const result =
        await update(
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
    organizationTimeZone: string,
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
        getDateInTimeZone(
            new Date(),
            organizationTimeZone,
        );

    return await findByDate(
        organizationId,
        today,
    );
}

function getDateInTimeZone(
    date: Date,
    timeZone: string,
): string {
    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            },
        ).formatToParts(date);

    const year =
        parts.find(
            (part) =>
                part.type === "year",
        )?.value;

    const month =
        parts.find(
            (part) =>
                part.type === "month",
        )?.value;

    const day =
        parts.find(
            (part) =>
                part.type === "day",
        )?.value;

    if (
        year === undefined ||
        month === undefined ||
        day === undefined
    ) {
        throw new BadRequestError(
            "Unable to determine organization date.",
        );
    }

    return `${year}-${month}-${day}`;
}