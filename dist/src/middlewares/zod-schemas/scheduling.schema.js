"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulingSchema = void 0;
const zod_1 = require("zod");
const appointment_time_type_1 = require("../../models/enums/appointment-time-type");
const uuidSchema = zod_1.z.uuid('Invalid UUID');
const fromAtUTCSchema = zod_1.z
    .string()
    .datetime({ offset: true })
    .or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/));
exports.schedulingSchema = zod_1.z
    .object({
    userUuid: uuidSchema,
    serviceUuid: uuidSchema,
    timeType: zod_1.z.enum(appointment_time_type_1.AppointmentTimeType),
    workerUuid: uuidSchema.optional(),
    fromAtUTC: fromAtUTCSchema.optional(),
})
    .strict()
    .superRefine((data, ctx) => {
    if (data.timeType === appointment_time_type_1.AppointmentTimeType.WORKER) {
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
                message: 'Start time is not allowed when a worker is selected.',
            });
        }
        return;
    }
    if (data.timeType === appointment_time_type_1.AppointmentTimeType.NEAREST) {
        if (data.workerUuid !== undefined) {
            ctx.addIssue({
                code: 'custom',
                path: ['workerUuid'],
                message: 'Worker is not allowed for nearest availability.',
            });
        }
        if (!data.fromAtUTC) {
            ctx.addIssue({
                code: 'custom',
                path: ['fromAtUTC'],
                message: 'Start time is required for nearest availability.',
            });
        }
    }
});
