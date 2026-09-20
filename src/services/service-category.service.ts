import {
    findAll,
    findByUuid,
    create,
    update,
    isNameFound,
    findCategoryIds,
    countAll
} from "../repositories/service-category.repository.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { BadRequestError } from "../errors/bad-request.error.js";
import { ConflictError } from "../errors/conflict.error.js";
import {
    CreateServiceCategory,
    QueryServiceCategory,
    ServiceCategory,
    UpdateServiceCategory
} from "../models/service-category.model.js";

export async function getServiceCategories(query: QueryServiceCategory): Promise<ServiceCategory[]> {
    return await findAll(query);
}

export async function getNumberOfServiceCategories(query: QueryServiceCategory): Promise<number> {
    return await countAll(query);
}

export async function getServiceCategory(uuid: string): Promise<ServiceCategory> {
    const result: ServiceCategory = await findByUuid(uuid);
    if (result === undefined) {
        throw new NotFoundError("ServiceCategory");
    }
    return result;
}

export async function createServiceCategory(category: CreateServiceCategory): Promise<ServiceCategory> {
    if (await isNameFound(category.name)) {
        throw new ConflictError();
    }
    const result: ServiceCategory = await create(category);
    if (result === undefined) {
        throw new BadRequestError();
    }
    return result;
}

export async function updateServiceCategory(category: UpdateServiceCategory): Promise<ServiceCategory> {
    const result: ServiceCategory = await update(category);
    if (result === undefined) {
        throw new NotFoundError("ServiceCategory");
    }
    return result;
}


export async function getCategoryIds(serviceCategoryUuids: string[]): Promise<number[]> {
    const categoryIds = await findCategoryIds(serviceCategoryUuids);
    if (categoryIds.length !== serviceCategoryUuids.length) {
        throw new NotFoundError("Service Categories");
    }
    return categoryIds
}