import { findAll, findByUuid, updateDay, countAll, createWorkingDays, updateDays } from "../repositories/working-hours.repository";
import {findIdByUuid,} from "../repositories/organizaiton.repository";
import {NotFoundError,} from "../errors/not-found.error";
import {CreateWorkingHours, QueryWorkingHours, UpdateWorkingHours,UpdateDayWorkingHours, WorkingHours, WorkingHoursResponse} from "../models/working-hours.model";
import {DayOfWeek }from "../models/enums/day-of-week";
import { verifyOrganizationOwnership } from '../middlewares/authorization/authorization';
import { PoolClient } from 'pg';

export async function getWorkingHours(query: QueryWorkingHours): Promise<WorkingHoursResponse[]> {
    return await findAll(query);
}

export async function getNumberOfWorkingHours(query: QueryWorkingHours): Promise<number> {
    return await countAll(query);
}

export async function getWorkingHour(workingHoursUuid: string, organizationUuid: string,): Promise<WorkingHoursResponse> {
    const result = await findByUuid(organizationUuid, workingHoursUuid,);
    if (result === undefined) {
        throw new NotFoundError("Working Hours");
    }
    return result;
}

export async function updateWorkingHours(workingHours: UpdateDayWorkingHours): Promise<WorkingHours> {
    await verifyOrganizationOwnership(workingHours.userUuid, workingHours.organizationUuid);
    const organizationId = await findIdByUuid(workingHours.organizationUuid);
    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }
    workingHours.organizationId=organizationId;
    const result = await updateDay(workingHours);
    if (result === undefined) {
        throw new NotFoundError("Working Hours");
    }
    return result;
}


export async function updateOrganizationWorkingHours(workingHours: UpdateWorkingHours): Promise<WorkingHours[]> {
    await verifyOrganizationOwnership(workingHours.userUuid, workingHours.organizationUuid);
    const organizationId = await findIdByUuid(workingHours.organizationUuid);
    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }
    workingHours.organizationId=organizationId;
    return await updateDays(workingHours);
}

export async function createWorkingDaysService(organizationId: number,client:PoolClient): Promise<void> {
    const workingHoursForDays: CreateWorkingHours[] = Object.values(DayOfWeek).map((day) => ({dayOfWeek: day, organizationId,}));
    await createWorkingDays(workingHoursForDays,client);
}