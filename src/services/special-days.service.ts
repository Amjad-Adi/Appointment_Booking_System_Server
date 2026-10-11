import { verifyOrganizationOwnership } from '../middlewares/authorization/authorization';
import { CreateSpecialDay, QuerySpecialDay, SpecialDay, UpdateSpecialDay } from '../models/special-days.model';
import { NotFoundError } from '../errors/not-found.error';
import { getOrganizationIdByUuid } from './organization.service';
import { countAll, create, findAll, findByUuid, update } from '../repositories/special-days.repository';

export async function getSpecialDays(query: QuerySpecialDay): Promise<SpecialDay[]> {
    return await findAll(query);
}

export async function getNumberOfSpecialDays(query: QuerySpecialDay): Promise<number> {
    return await countAll(query);
}

export async function getSpecialDay(specialDayUuid: string, organizationUuid: string): Promise<SpecialDay> {
    const result = await findByUuid(specialDayUuid, organizationUuid);
    if (result === undefined) {
        throw new NotFoundError("Special Day");
    }
    return result;
}

export async function createSpecialDay(specialDay: CreateSpecialDay): Promise<SpecialDay> {
    await verifyOrganizationOwnership(specialDay.userUuid, specialDay.organizationUuid);
    const organizationId = await getOrganizationIdByUuid(specialDay.organizationUuid);
    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }
    specialDay.organizationId=organizationId;
    return await create(specialDay);
}

export async function updateSpecialDay(specialDay: UpdateSpecialDay): Promise<SpecialDay> {
    await verifyOrganizationOwnership(specialDay.userUuid, specialDay.organizationUuid);
    const organizationId = await getOrganizationIdByUuid(specialDay.organizationUuid);
    if (organizationId === undefined) {
        throw new NotFoundError("Organization");
    }
    specialDay.organizationId=organizationId;
    const result = await update(specialDay);
    if (result === undefined) {
        throw new NotFoundError("Special Day");
    }
    return result;
}
