import { findAll, findByUuid, create, update, countAll } from "../repositories/time-block.repository";
import { NotFoundError } from "../errors/not-found.error";
import type { CreateTimeBlock, QueryTimeBlock, TimeBlock, TimeBlockResponse, UpdateTimeBlock } from "../models/time-block.model";
import { getOrganization } from "./organization.service";
import { getUtcDateRangeForLocalDate } from "../utils/timezone";
import { verifyOrganizationOwnership } from "../middlewares/authorization/authorization";

function applyDateRange(query: QueryTimeBlock, timeZone: string): QueryTimeBlock {
    const fromDate = query.filter?.fromDate;
    const toDate = query.filter?.toDate;
    if (fromDate === undefined || toDate === undefined) {
        return query;
    }
    const startRange = getUtcDateRangeForLocalDate(fromDate, timeZone);
    const endRange = getUtcDateRangeForLocalDate(toDate, timeZone);
    return {
        ...query,
        filter: {
            ...query.filter,
            fromDate: startRange.startUTC,
            toDate: endRange.endUTC,
        },
    };
}

export async function getTimeBlocks(query: QueryTimeBlock): Promise<TimeBlockResponse[]> {
    const organizationUuid = query.filter?.organizationUuid;
    if (organizationUuid === undefined) {
        throw new NotFoundError("Organization");
    }
    const organization = await getOrganization(organizationUuid);
    if (organization === undefined) {
        throw new NotFoundError("Organization");
    }
    const queryWithDateRange = applyDateRange(query, organization.location.timezone);
    return await findAll(queryWithDateRange);
}

export async function getNumberOfTimeBlocks(query: QueryTimeBlock): Promise<number> {
    const organizationUuid = query.filter?.organizationUuid;
    if (organizationUuid === undefined) {
        throw new NotFoundError("Organization");
    }
    const organization = await getOrganization(organizationUuid);
    if (organization === undefined) {
        throw new NotFoundError("Organization");
    }
    const queryWithDateRange = applyDateRange(query, organization.location.timezone);
    return await countAll(queryWithDateRange);
}

export async function getTimeBlock(timeBlockUuid: string, organizationUuid: string, userUuid: string): Promise<TimeBlockResponse> {
    await verifyOrganizationOwnership(userUuid, organizationUuid);
    const result = await findByUuid(organizationUuid, timeBlockUuid);
    if (result === undefined) {
        throw new NotFoundError("Time Block");
    }
    return result;
}

export async function createTimeBlock(timeBlock: CreateTimeBlock): Promise<TimeBlock> {
    await verifyOrganizationOwnership(timeBlock.requestUserUuid, timeBlock.organizationUuid);
    const result = await create(timeBlock);
    if (result === undefined) {
        throw new NotFoundError("Organization or Request User");
    }
    return result;
}

export async function updateTimeBlock(timeBlock: UpdateTimeBlock): Promise<TimeBlock> {
    await verifyOrganizationOwnership(timeBlock.respondUserUuid, timeBlock.organizationUuid);
    const result = await update(timeBlock);
    if (result === undefined) {
        throw new NotFoundError("Time Block");
    }
    return result;
}