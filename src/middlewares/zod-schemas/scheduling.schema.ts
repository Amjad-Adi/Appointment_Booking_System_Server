import { z } from 'zod';
import { AppointmentTimeType } from '../../models/enums/appointment-time-type';

export const schedulingSchema = z.object({
    userUuid: z.uuid('Invalid UUID'),
    serviceUuid: z.uuid('Invalid UUID'),
    timeType: z.enum(AppointmentTimeType),
    workerUuid: z.uuid('Invalid UUID').optional(),
    fromAtUTC: z.iso.datetime({ offset: true, error: 'Start time must be a valid ISO datetime with an offset' }).optional(),
}).strict().superRefine((data, ctx) => {
    if (data.timeType === AppointmentTimeType.WORKER) {
        if (!data.workerUuid) {
            ctx.addIssue({
                code: 'custom',
                path: ['workerUuid'],
                message: 'Worker is required',
            });
        }
        if (data.fromAtUTC !== undefined) {
            ctx.addIssue({
                code: 'custom',
                path: ['fromAtUTC'],
                message: 'Start time is not allowed when a worker is selected',
            });
        }
        return;
    }
    if (data.timeType === AppointmentTimeType.NEAREST) {
        if (data.workerUuid !== undefined) {
            ctx.addIssue({
                code: 'custom',
                path: ['workerUuid'],
                message: 'Worker is not allowed for nearest availability',
            });
        }
        if (!data.fromAtUTC) {
            ctx.addIssue({
                code: 'custom',
                path: ['fromAtUTC'],
                message: 'Start time is required for nearest availability',
            });
        }
    }
});