import { z } from "zod";
import { ActivationStatus } from "./enums/activation-status";
import { createSpecialDaySchema, querySpecialDaySchema, updateSpecialDaySchema } from '../middlewares/zod-schemas/special-days.schema';
import { DataResponses } from './query.model';

export interface SpecialDay {
    uuid: string;
    name: string;
    description: string|null;
    dayDate: string;
    createdAtUTC: Date;
    updatedAtUTC: Date;
    status: ActivationStatus;
}
export interface SpecialDayResponse extends SpecialDay,DataResponses{
    organizationUuid:string,
    organizationName:string
}

export type CreateSpecialDay = z.infer<typeof createSpecialDaySchema> & { organizationUuid: string; organizationId: number; userUuid: string; };
export type UpdateSpecialDay = z.infer<typeof updateSpecialDaySchema> & { uuid: string; organizationUuid: string; organizationId: number; userUuid: string; };
export type QuerySpecialDay = z.infer<typeof querySpecialDaySchema> & {offset?: number; };