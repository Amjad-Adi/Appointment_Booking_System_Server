import {z} from "zod";
import {
    createServiceJunctionCategorySchema,
     updateServiceJunctionCategorySchema
} from "../middlewares/zod-schemas/service-category-junction.schema";

export interface ServiceJunctionCategory {
    serviceUuid: string;
    serviceCategoryUuid: string;
}

export type CreateServiceJunctionCategory = z.infer<typeof createServiceJunctionCategorySchema>&{serviceUuid:string,organizationUuid:string,userUuid:string};
export type UpdateServiceJunctionCategory = z.infer<typeof updateServiceJunctionCategorySchema>&{serviceUuid:string,organizationUuid:string,userUuid:string};;