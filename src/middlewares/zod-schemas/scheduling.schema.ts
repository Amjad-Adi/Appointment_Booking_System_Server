import { z } from 'zod';

import { AppointmentTimeType } from '../../models/enums/appointment-time-type';

const uuidSchema = z.uuid('Invalid UUID');

const fromAtUTCSchema = z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/));

export const schedulingSchema = z
    .object({
        userUuid: uuidSchema,

        serviceUuid: uuidSchema,

        timeType: z.enum(AppointmentTimeType),

        workerUuid: uuidSchema.optional(),

        fromAtUTC: fromAtUTCSchema.optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
        if (data.timeType === AppointmentTimeType.WORKER) {
            if (!data.workerUuid) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['workerUuid'],
                    message: 'Worker is required.',
                });
            }

            if (data.fromAtUTC !== undefined) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['fromAtUTC'],
                    message:
                        'Start time is not allowed when a worker is selected.',
                });
            }

            return;
        }

        if (data.timeType === AppointmentTimeType.NEAREST) {
            if (data.workerUuid !== undefined) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['workerUuid'],
                    message:
                        'Worker is not allowed for nearest availability.',
                });
            }

            if (!data.fromAtUTC) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['fromAtUTC'],
                    message:
                        'Start time is required for nearest availability.',
                });
            }
        }
    });

export type SchedulingForm = z.infer<typeof schedulingSchema>;
