import { z } from "zod";

import { querySchema } from "./query.schema.js";

import {
    SORT_BY_NAME,
    SORT_BY_SCHEDULED_START_AT_UTC,
    SORT_BY_SCHEDULED_END_AT_UTC,
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_APPOINTMENT_STATUS,
    SORT_BY_PAYMENT_STATUS,
} from "../../databases/contracts/appointment.contract.js";

import { AppointmentStatus } from "../../models/enums/appointment-status.js";
import { AppointmentTimeType } from "../../models/enums/appointment-time-type.js";
import { PaymentMethod } from "../../models/enums/payment-method.js";
import { PaymentStatus } from "../../models/enums/payment-status.js";

const uuidSchema = z.uuid("Invalid UUID");

const colourSchema = z
    .string()
    .regex(
        /^#[0-9A-Fa-f]{6}$/,
        "Invalid colour",
    );

export const createAppointmentSchema = z.object({
    serviceUuid: uuidSchema,

    timeType: z.enum(AppointmentTimeType),

    workerUuid: uuidSchema.optional(),

    roomUuid: uuidSchema.optional(),

    scheduledStartTimeUTC: z.iso.datetime({
        offset: true,
    }),

    userNote: z
        .string()
        .trim()
        .max(4096)
        .nullable()
        .optional(),

    userColour: colourSchema.optional(),

    paymentMethod: z
        .enum(PaymentMethod)
        .nullable()
        .optional(),
}).strict().superRefine((data, ctx) => {
    if (data.timeType === AppointmentTimeType.WORKER) {
        if (!data.workerUuid) {
            ctx.addIssue({
                code: "custom",
                path: ["workerUuid"],
                message: "Worker UUID is required",
            });
        }

        if (!data.roomUuid) {
            ctx.addIssue({
                code: "custom",
                path: ["roomUuid"],
                message: "Room UUID is required",
            });
        }
    }

    if (data.timeType === AppointmentTimeType.NEAREST) {
        if (data.workerUuid !== undefined) {
            ctx.addIssue({
                code: "custom",
                path: ["workerUuid"],
                message: "Worker UUID is not allowed for nearest appointment",
            });
        }

        if (data.roomUuid !== undefined) {
            ctx.addIssue({
                code: "custom",
                path: ["roomUuid"],
                message: "Room UUID is not allowed for nearest appointment",
            });
        }
    }
});

export const updateAppointmentSchemaByUser = z.object({
    userNote: z
        .string()
        .trim()
        .max(4096)
        .nullable()
        .optional(),

    userColour: colourSchema.optional(),
}).strict();

export const updateAppointmentSchemaByOrganization = z.object({
    organizationNote: z
        .string()
        .trim()
        .max(4096)
        .nullable()
        .optional(),

    organizationColour: colourSchema.optional(),
}).strict();

export const confirmAppointmentSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1)
        .max(256),

    organizationColour: colourSchema.optional(),

    organizationNote: z
        .string()
        .trim()
        .max(4096)
        .nullable()
        .optional(),
}).strict();

export const rejectAppointmentSchemaBy = z.object({
    rejectionReason: z
        .string()
        .trim()
        .min(1)
        .max(4096),
}).strict();

export const updateAppointmentSchemaStatus = z.object({
    appointmentStatus: z
        .enum(AppointmentStatus)
        .refine(
            (status) =>
                status !== AppointmentStatus.PENDING_USER_CONFIRMATION &&
                status !== AppointmentStatus.PENDING_ORGANIZATION_APPROVAL &&
                status !== AppointmentStatus.REJECTED,
            {
                message: "Invalid status transition",
            },
        ),
}).strict();

export const payAppointmentSchema = z.object({
    paymentMethod: z.enum(PaymentMethod),
}).strict();

export const appointmentFilterSchema = z.object({
    organizationUuid: uuidSchema.optional(),

    appointmentStatus: z
        .enum(AppointmentStatus)
        .optional(),

    appointmentDate: z
        .iso.date()
        .optional(),

    fromDate: z
        .iso.date()
        .optional(),

    toDate: z
        .iso.date()
        .optional(),

    userUuid: uuidSchema.optional(),

    approvalUserUuid: uuidSchema.optional(),

    workerUuid: uuidSchema.optional(),

    serviceUuid: uuidSchema.optional(),

    roomUuid: uuidSchema.optional(),

    paymentMethod: z
        .enum(PaymentMethod)
        .optional(),

    paymentStatus: z
        .enum(PaymentStatus)
        .optional(),
}).strict().superRefine((data, ctx) => {
    if (
        data.fromDate !== undefined &&
        data.toDate !== undefined &&
        data.fromDate > data.toDate
    ) {
        ctx.addIssue({
            code: "custom",
            path: ["toDate"],
            message: "To date must be after or equal to from date",
        });
    }
});

export const queryAppointmentSchema = querySchema.extend({
    search: z
        .string()
        .trim()
        .nonempty()
        .max(256)
        .optional(),

    filter: appointmentFilterSchema.optional(),

    sortBy: z.enum([
        SORT_BY_NAME,
        SORT_BY_SCHEDULED_START_AT_UTC,
        SORT_BY_SCHEDULED_END_AT_UTC,
        SORT_BY_CREATED_AT_UTC,
        SORT_BY_APPOINTMENT_STATUS,
        SORT_BY_PAYMENT_STATUS,
    ]).optional(),
}).strict();