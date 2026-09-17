import type { z } from "zod";

import type {
    schedulingSchema,
} from "../middlewares/zod-schemas/scheduling.schema.js";

export interface SchedulingWorker {
    uuid: string;
    firstName: string;
    lastName: string;
    profilePicturePath: string | null;
}

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

    room: {
        uuid: string;
        name: string;
    };

    scheduledStartAtUTC: string;
    scheduledEndAtUTC: string;
}

export interface SchedulingWorkerOptions {
    worker: SchedulingWorker;
    options: SchedulingOption[];
}

export interface SchedulingResponse {
    workers: SchedulingWorkerOptions[];
}

export type SchedulingRequest =
    z.infer<typeof schedulingSchema> & {
    userId: number;
};