import { z } from "zod";

import {
    createTimeBlockSchema,
    queryTimeBlockSchema,
    updateTimeBlockSchema,
} from "../middlewares/zod-schemas/time-block.schema.js";

import { TimeBlockStatus } from "./enums/time-block-status.js";

export interface TimeBlock {
    uuid: string;

    reason: string | null;

    startAtUTC: string;

    endAtUTC: string;

    requestedAtUTC: string;

    respondedAtUTC: string | null;

    requestStatus: TimeBlockStatus;
}

export interface TimeBlockResponse extends TimeBlock {
    requestUserUuid: string;
    requestUserFirstName: string;
    requestUserLastName: string;
    requestUserProfilePicturePath: string | null;

    respondUserUuid: string | null;
    respondUserFirstName: string | null;
    respondUserLastName: string | null;
    respondUserProfilePicturePath: string | null;
}

export type CreateTimeBlock =
    z.infer<typeof createTimeBlockSchema> & {
    requestUserUuid: string;
    requestUserId: number;
    organizationUuid: string;
    organizationId: number;
};

export type UpdateTimeBlock =
    z.infer<typeof updateTimeBlockSchema> & {
    uuid: string;
    respondUserUuid: string;
    respondUserId: number;
    organizationUuid: string;
};

export type QueryTimeBlock =
    z.infer<typeof queryTimeBlockSchema> & {
    organizationId: number;
    offset: number;
};