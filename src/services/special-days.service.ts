import { verifyOrganizationOwnership } from '../middlewares/authorization/authorization';
import { CreateSpecialDay, QuerySpecialDay, SpecialDay, UpdateSpecialDay } from '../models/special-days.model';
import { NotFoundError } from '../errors/not-found.error';
import { BadRequestError } from '../errors/bad-request.error';
import { ActivationStatus } from '../models/enums/activation-status';
import { getOrganization, getOrganizationIdByUuid } from './organization.service';
import { countAll, create, findAll, findByUuid, update } from '../repositories/special-days.repository';

function getDateInTimeZone(date: Date, timeZone: string): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

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

    const current = await findByUuid(specialDay.uuid, specialDay.organizationUuid);
    if (current === undefined) {
        throw new NotFoundError("Special Day");
    }

    /*
     * A closed day can only be reopened (ACTIVE -> INACTIVE) before its date
     * arrives. Once the day has started, the closure is historical and must
     * remain in effect.
     */
    if (
        current.status === ActivationStatus.ACTIVE &&
        specialDay.status === ActivationStatus.INACTIVE
    ) {
        const dayDate = specialDay.dayDate ?? current.dayDate;
        const organization = await getOrganization(specialDay.organizationUuid);
        const today = getDateInTimeZone(new Date(), organization.location.timezone);

        if (dayDate <= today) {
            throw new BadRequestError("A special day can only be reopened before its date");
        }
    }

    specialDay.organizationId=organizationId;
    const result = await update(specialDay);
    if (result === undefined) {
        throw new NotFoundError("Special Day");
    }
    return result;
}
