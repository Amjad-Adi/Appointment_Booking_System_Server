import type { z } from 'zod';

import type { schedulingSchema } from '../middlewares/zod-schemas/scheduling.schema.js';

export interface SchedulingOption {
    organization: {
        uuid: string;
        name: string;
    };

    service: {
        uuid: string;
        name: string;
        durationInMinutes: number;
    };

    worker: {
        uuid: string;
        firstName: string;
        lastName: string;
        profilePicturePath: string;
    };

    room: {
        uuid: string;
        name: string;
    };

    scheduledStartAtUTC: string;
    scheduledEndAtUTC: string;
}

export interface SchedulingResponse {
    options: SchedulingOption[];
}

export type SchedulingRequest = z.infer<typeof schedulingSchema> & {
    userId: number;
};