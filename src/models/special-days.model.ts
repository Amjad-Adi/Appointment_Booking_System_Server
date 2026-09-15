import { z } from "zod";

import {
    createSpecialDaySchema,
    querySpecialDaySchema,
    updateSpecialDaySchema,
} from "../middlewares/zod-schemas/special-days.schema.js";

import { ActivationStatus } from "./enums/activation-status.js";

export interface SpecialDay {
    uuid: string;

    name: string;

    description: string | null;

    dayDate: string;

    createdAtUTC: string;

    updatedAtUTC: string;

    status: ActivationStatus;
}

export type CreateSpecialDay =
    z.infer<typeof createSpecialDaySchema> & {
    organizationUuid: string;
    organizationId: number;
    userUuid: string;
};

export type UpdateSpecialDay =
    z.infer<typeof updateSpecialDaySchema> & {
    uuid: string;
    organizationUuid: string;
    userUuid: string;
};

export type QuerySpecialDay =
    z.infer<typeof querySpecialDaySchema> & {
    organizationId: number;
    offset: number;
};