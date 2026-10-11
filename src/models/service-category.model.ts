import { z } from 'zod';

import { ActivationStatus } from './enums/activation-status';

import {
    createServiceCategorySchema,
    queryServiceCategorySchema,
    serviceCategoryFilterSchema,
    updateServiceCategorySchema,
} from '../middlewares/zod-schemas/service-categoty.schema';

import {
    DataResponses,
    Filter,
} from './query.model';

export interface ServiceCategory {
    uuid: string;
    name: string;
    description?: string;
    picturePath: string;
    createdAtUTC: Date;
    updatedAtUTC: Date;
    status: ActivationStatus;
}

export interface ServiceCategoryResponse extends ServiceCategory, DataResponses {}
export type CreateServiceCategory = z.infer<typeof createServiceCategorySchema>&{picturePath?:string,picturePathId?:string};
export type UpdateServiceCategory = z.infer<typeof updateServiceCategorySchema> & { uuid: string,picturePath?:string,picturePathId?:string};
export type QueryServiceCategory = z.infer<typeof queryServiceCategorySchema> & { offset: number; };