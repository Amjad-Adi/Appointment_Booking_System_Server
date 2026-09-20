import type { z } from "zod";
import type { schedulingSchema } from "../middlewares/zod-schemas/scheduling.schema.js";

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
        profilePicturePath: string | null;
    };

    room: {
        uuid: string;
        name: string;
    };

    scheduledStartAtUTC: string;
    scheduledEndAtUTC: string;
}

export interface SchedulingWorkerOptions {
    worker: SchedulingOption["worker"];
    options: SchedulingOption[];
}

export interface SchedulingResponse {
    workers: SchedulingWorkerOptions[];
}

export type SchedulingRequest =
    z.infer<typeof schedulingSchema> & {
    userId: number;
};