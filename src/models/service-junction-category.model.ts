import {z} from "zod";
import {
    createServiceJunctionCategorySchema,
     updateServiceJunctionCategorySchema
} from "../middlewares/zod-schemas/service-category-junction.schema.js";

export interface ServiceJunctionCategory {
    serviceUuid: string;
    serviceCategoryUuid: string;
}

export type CreateServiceJunctionCategory = z.infer<typeof createServiceJunctionCategorySchema>;

export type UpdateServiceJunctionCategory = z.infer<typeof updateServiceJunctionCategorySchema>;