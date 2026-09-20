import {
    findAll,
    findByUuid,
    create,
    update,
    countAll,
} from "../repositories/time-block.repository.js";

import {
    findIdByUuid,
} from "../repositories/organizaiton.repository.js";

import {
    AuthorizeOrganizationUser,
    getUserIdByUuid,
} from "./user.service.js";

import {
    NotFoundError,
} from "../errors/not-found.error.js";

import {
    BadRequestError,
} from "../errors/bad-request.error.js";

import type {
    CreateTimeBlock,
    QueryTimeBlock,
    TimeBlock,
    TimeBlockResponse,
    UpdateTimeBlock,
} from "../models/time-block.model.js";

import {
    getOrganizationIdByUuid,
    getOrganization,
} from "./organization.service.js";

import {
    getUtcDateRangeForLocalDate,
} from "../utils/timezone.js";


function applyDateRange(
    query: QueryTimeBlock,
    timeZone: string,
): QueryTimeBlock {
    const fromDate =
        query.filter?.fromDate;

    const toDate =
        query.filter?.toDate;

    if (
        fromDate === undefined ||
        toDate === undefined
    ) {
        return query;
    }

    const startRange =
        getUtcDateRangeForLocalDate(
            fromDate,
            timeZone,
        );

    const endRange =
        getUtcDateRangeForLocalDate(
            toDate,
            timeZone,
        );

    return {
        ...query,
        filter: {
            ...query.filter,
            fromDate: startRange.startUTC,
            toDate: endRange.endUTC,
        },
    };
}
export async function getTimeBlocks(
    query: QueryTimeBlock,
): Promise<TimeBlockResponse[]> {
    const organizationUuid =
        query.filter?.organizationUuid;

    if (organizationUuid === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const organization =
        await getOrganization(
            organizationUuid,
        );

    if (organization === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const organizationId =
        await getOrganizationIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const queryWithDateRange =
        applyDateRange(
            {
                ...query,
                organizationId,
            },
            organization.location.timezone,
        );

    return await findAll(
        queryWithDateRange,
    );
}
export async function getNumberOfTimeBlocks(
    query: QueryTimeBlock,
): Promise<number> {
    const organizationUuid =
        query.filter?.organizationUuid;

    if (organizationUuid === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const organization =
        await getOrganization(
            organizationUuid,
        );

    if (organization === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const organizationId =
        await getOrganizationIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const queryWithDateRange =
        applyDateRange(
            {
                ...query,
                organizationId,
            },
            organization.location.timezone,
        );

    return await countAll(
        queryWithDateRange,
    );
}
export async function getTimeBlock(
    timeBlockUuid: string,
    organizationUuid: string,
    userUuid: string,
): Promise<TimeBlockResponse> {
    await AuthorizeOrganizationUser(
        userUuid,
        organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const result =
        await findByUuid(
            organizationId,
            timeBlockUuid,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Time Block",
        );
    }

    return result;
}

export async function createTimeBlock(
    timeBlock: CreateTimeBlock,
): Promise<TimeBlock> {
    /*
     * Never trust requestUserUuid from the
     * request body.
     */
    await AuthorizeOrganizationUser(
        timeBlock.requestUserUuid,
        timeBlock.organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            timeBlock.organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const requestUserId =
        await getUserIdByUuid(
            timeBlock.requestUserUuid
        );

    if (requestUserId === undefined) {
        throw new NotFoundError(
            "Request User",
        );
    }

    const result =
        await create({
            ...timeBlock,
            organizationId,

            requestUserId,
        });

    if (result === undefined) {
        throw new BadRequestError();
    }

    return result;
}

export async function updateTimeBlock(
    timeBlock: UpdateTimeBlock,
): Promise<TimeBlock> {
    await AuthorizeOrganizationUser(
        timeBlock.respondUserUuid,
        timeBlock.organizationUuid,
    );

    const organizationId =
        await findIdByUuid(
            timeBlock.organizationUuid,
        );

    if (organizationId === undefined) {
        throw new NotFoundError(
            "Organization",
        );
    }

    const respondUserId =
        await getUserIdByUuid(
            timeBlock.respondUserUuid,
        );

    if (respondUserId === undefined) {
        throw new NotFoundError(
            "Responding User",
        );
    }

    const result =
        await update(
            {
                ...timeBlock,
                respondUserId,
            },
            organizationId,
        );

    if (result === undefined) {
        throw new NotFoundError(
            "Time Block",
        );
    }

    return result;
}