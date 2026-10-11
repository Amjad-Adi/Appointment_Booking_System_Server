import { create, update } from "../repositories/service-junction-category.repository";
import { NotFoundError } from "../errors/not-found.error";
import {getServiceIdByUuid} from "./service.service";
import { getCategoryIds } from "./service-category.service"
import { verifyOrganizationOwnership } from '../middlewares/authorization/authorization';
import { CreateServiceJunctionCategory, UpdateServiceJunctionCategory } from '../models/service-junction-category.model';

export async function createServiceJunctionCategories(serviceJunctionCategory:CreateServiceJunctionCategory): Promise<void> {
    await verifyOrganizationOwnership(serviceJunctionCategory.userUuid,serviceJunctionCategory.organizationUuid)
    const serviceId = await getServiceIdByUuid(serviceJunctionCategory.serviceUuid,serviceJunctionCategory.organizationUuid);
    if (!serviceId) {
        throw new NotFoundError("Service");
    }
    const categoryIds = await getCategoryIds(serviceJunctionCategory.serviceCategoryUuids);
    if (categoryIds.length !== serviceJunctionCategory.serviceCategoryUuids.length)
        throw new NotFoundError("Service Categories");
    await create(serviceId, categoryIds);
}

export async function updateServiceJunctionCategories(serviceJunctionCategory:UpdateServiceJunctionCategory): Promise<void> {
    await verifyOrganizationOwnership(serviceJunctionCategory.userUuid,serviceJunctionCategory.organizationUuid)
    const serviceId = await getServiceIdByUuid(serviceJunctionCategory.serviceUuid,serviceJunctionCategory.organizationUuid);
    if (!serviceId) {
        throw new NotFoundError("Service");
    }
    const categoryIds = await getCategoryIds(serviceJunctionCategory.serviceCategoryUuids);
    if (categoryIds.length !== serviceJunctionCategory.serviceCategoryUuids.length){
        throw new NotFoundError("Service Categories");
    }
    await update(serviceId, categoryIds);
}
