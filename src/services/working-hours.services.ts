import {
    findAll,
    findByUuid,
    update,
    countAll,
    createWorkingDays,
    findTodayWorkingHours, updateWeek,
} from "../repositories/working-hours.repository.js";
import {findIdByUuid,} from "../repositories/organizaiton.repository.js";
import {AuthorizeOrganizationUser,} from "./user.service.js";
import {NotFoundError,} from "../errors/not-found.error.js";
import {BadRequestError,} from "../errors/bad-request.error.js";
import type {
    CreateWorkingHours,
    QueryWorkingHours, UpdateOrganizationWorkingHours,
    UpdateWorkingHours,
    WorkingHours,
    WorkingHoursResponse,
} from "../models/working-hours.model.js";
import {DayOfWeek }from "../models/enums/day-of-week.js";

export async function getWorkingHours(query: QueryWorkingHours,): Promise<WorkingHoursResponse[]> {
    return await findAll(query);
}

export async function getNumberOfWorkingHours(query: QueryWorkingHours,): Promise<number> {
    return await countAll(query);
}

export async function getWorkingHour(workingHoursUuid: string, organizationUuid: string,): Promise<WorkingHoursResponse> {
    const result = await findByUuid(organizationUuid, workingHoursUuid,);
    if (result === undefined) {
        throw new NotFoundError("Working Hours");
    }
    return result;
}

export async function updateWorkingHours(workingHours: UpdateWorkingHours,): Promise<WorkingHours> {
    await AuthorizeOrganizationUser(workingHours.userUuid, workingHours.organizationUuid,);
    const organizationId = await findIdByUuid(workingHours.organizationUuid,);
    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }
    const result = await update(organizationId, workingHours);
    if (result === null) {
        throw new NotFoundError("Working Hours");
    }
    return result;
}


export async function updateOrganizationWorkingHours(workingHours: UpdateOrganizationWorkingHours,): Promise<WorkingHours[]> {
    await AuthorizeOrganizationUser(workingHours.userUuid, workingHours.organizationUuid,);
    const organizationId = await findIdByUuid(workingHours.organizationUuid,);
    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }
    return await updateWeek(organizationId, workingHours.days,);
}

export async function createWorkingDaysService(organizationId: number,): Promise<void> {
    const workingHoursForDays: CreateWorkingHours[] = Object.values(DayOfWeek).map((day) => ({dayOfWeek: day, organizationId,}));
    await createWorkingDays(workingHoursForDays);
}

export async function findTodayWorkingHoursService(organizationUuid: string, day: DayOfWeek): Promise<WorkingHours> {
    const result = await findTodayWorkingHours(organizationUuid, day);
    if (result === undefined) {
        throw new NotFoundError("Working Hours");
    }
    return result;
}