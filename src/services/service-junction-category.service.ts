import { create, update } from "../repositories/service-junction-category.repository.js";
import { AuthorizeOrganizationUser } from "./user.service.js";
import { getOrganizationIdByUuid } from "./organization.service.js";
import { NotFoundError } from "../errors/not-found.error.js";
import {getService, getServiceIdByUuid} from "./service.service.js";
import { getCategoryIds } from "./service-category.service"

export async function createServiceJunctionCategories(serviceUuid: string, serviceCategoryUuids: string[], organizationUuid: string, userUuid: string): Promise<void> {
    await AuthorizeOrganizationUser(userUuid, organizationUuid);
    if (serviceCategoryUuids.length === 0)
        throw new NotFoundError("Service Categories");
    const serviceId = await getServiceIdByUuid(serviceUuid,organizationUuid);
    if (!serviceId) throw new NotFoundError("Service");
    const categoryIds = await getCategoryIds(serviceCategoryUuids);
    if (categoryIds.length !== serviceCategoryUuids.length) throw new NotFoundError("Service Categories");
    await create(serviceId, categoryIds);
}

export async function updateServiceJunctionCategories(serviceUuid: string, serviceCategoryUuids: string[], organizationUuid: string, userUuid: string): Promise<void> {
    await AuthorizeOrganizationUser(userUuid, organizationUuid);
    if (serviceCategoryUuids.length === 0) {
        throw new NotFoundError("Service Categories");
    }
    const serviceId = await getServiceIdByUuid(serviceUuid,organizationUuid);
    if (!serviceId) {
        throw new NotFoundError("Service");
    }
    const categoryIds = await getCategoryIds(serviceCategoryUuids);
    if (categoryIds.length !== serviceCategoryUuids.length){
        throw new NotFoundError("Service Categories");
    }

    await update(serviceId, categoryIds);
}