import { z } from 'zod';

import { querySchema } from './query.schema.js';

import {
    SORT_BY_NAME,
    SORT_BY_SCHEDULED_START_AT_UTC,
    SORT_BY_SCHEDULED_END_AT_UTC,
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_APPOINTMENT_STATUS,
    SORT_BY_PAYMENT_STATUS,
} from '../../databases/contracts/appointment.contract.js';

import { AppointmentStatus } from '../../models/enums/appointment-status.js';
import { AppointmentTimeType } from '../../models/enums/appointment-time-type.js';
import { PaymentMethod } from '../../models/enums/payment-method.js';
import { PaymentStatus } from '../../models/enums/payment-status.js';

const uuidSchema = z.uuid('Invalid UUID');

const colourSchema = z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid colour');

const appointmentNameSchema = z
    .string()
    .trim()
    .min(1, 'Appointment name is required')
    .max(256, 'Appointment name must not exceed 256 characters');

const scheduledStartSchema = z.iso.datetime({
    offset: true,
});


/*
 * Scheduling request.
 *
 * CUSTOMER:
 * - userUuid
 * - serviceUuid
 * - timeType
 * - fromAtUTC
 *
 * WORKER:
 * - userUuid
 * - serviceUuid
 * - timeType
 * - workerUuid
 * - fromAtUTC
 */
export const schedulingSchema = z
    .object({
        userUuid: uuidSchema,

        serviceUuid: uuidSchema,

        timeType: z.enum(AppointmentTimeType),

        workerUuid: uuidSchema.optional(),

        fromAtUTC: z
            .iso
            .datetime({
                offset: true,
            })
            .optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
        if (
            data.timeType === AppointmentTimeType.WORKER &&
            !data.workerUuid
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['workerUuid'],
                message:
                    'workerUuid is required when timeType is WORKER',
            });
        }

        if (
            data.timeType === AppointmentTimeType.NEAREST &&
            data.workerUuid !== undefined
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['workerUuid'],
                message:
                    'workerUuid is not allowed when timeType is NEAREST',
            });
        }
    });


/*
 * CUSTOMER / USER creates an appointment.
 *
 * This is the request sent by the customer.
 *
 * The customer provides:
 * - name
 * - service
 * - scheduling type
 * - selected worker
 * - selected start time
 * - customer note/colour
 * - payment method
 *
 * The backend resolves:
 * - organization ID
 * - user ID
 * - service ID
 * - worker ID
 * - room ID
 * - scheduled end time
 */
export const createAppointmentSchema = z
    .object({
        name: appointmentNameSchema,

        serviceUuid: uuidSchema,

        timeType: z.enum(AppointmentTimeType),

        workerUuid: uuidSchema,

        scheduledStartAtUTC: scheduledStartSchema,

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
    })
    .strict();


/*
 * ORGANIZATION creates an appointment for a customer.
 *
 * This is the request sent by an organization user.
 *
 * The organization provides:
 * - appointment name
 * - customer
 * - service
 * - worker
 * - start time
 * - organization note/colour
 * - payment method
 *
 * The backend resolves:
 * - organization ID
 * - customer ID
 * - service ID
 * - worker ID
 * - room ID
 * - scheduled end time
 *
 * The organization does NOT provide:
 * - timeType
 * - roomUuid
 * - scheduledEndAtUTC
 */
export const createOrganizationAppointmentSchema = z
    .object({
        name: appointmentNameSchema,

        userUuid: uuidSchema,

        serviceUuid: uuidSchema,

        workerUuid: uuidSchema,

        scheduledStartAtUTC: scheduledStartSchema,

        organizationNote: z
            .string()
            .trim()
            .max(4096)
            .nullable()
            .optional(),

        organizationColour: colourSchema.optional(),

        paymentMethod: z
            .enum(PaymentMethod)
            .nullable()
            .optional(),
    })
    .strict();


/*
 * USER updates their appointment.
 */
export const updateAppointmentSchemaByUser = z
    .object({
        userNote: z
            .string()
            .trim()
            .max(4096)
            .nullable()
            .optional(),

        userColour: colourSchema.optional(),
    })
    .strict();


/*
 * ORGANIZATION updates its appointment.
 */
export const updateAppointmentSchemaByOrganization = z
    .object({
        organizationNote: z
            .string()
            .trim()
            .max(4096)
            .nullable()
            .optional(),

        organizationColour: colourSchema.optional(),
    })
    .strict();


/*
 * ORGANIZATION confirms an appointment.
 */
export const confirmAppointmentSchema = z
    .object({
        name: appointmentNameSchema,

        organizationColour: colourSchema.optional(),

        organizationNote: z
            .string()
            .trim()
            .max(4096)
            .nullable()
            .optional(),
    })
    .strict();


/*
 * Reject appointment.
 */
export const rejectAppointmentSchemaBy = z
    .object({
        rejectionReason: z
            .string()
            .trim()
            .min(1)
            .max(4096),
    })
    .strict();


/*
 * Update appointment status.
 */
export const updateAppointmentSchemaStatus = z
    .object({
        appointmentStatus: z
            .enum(AppointmentStatus)
            .refine(
                (status) =>
                    status !==
                    AppointmentStatus.PENDING_USER_CONFIRMATION &&
                    status !==
                    AppointmentStatus.PENDING_ORGANIZATION_APPROVAL &&
                    status !== AppointmentStatus.REJECTED,
                {
                    message: 'Invalid status transition',
                },
            ),
    })
    .strict();


/*
 * Pay appointment.
 */
export const payAppointmentSchema = z
    .object({
        paymentMethod: z.enum(PaymentMethod),
    })
    .strict();


/*
 * Appointment filters.
 */
export const appointmentFilterSchema = z
    .object({
        organizationUuid: uuidSchema.optional(),

        appointmentStatus: z
            .enum(AppointmentStatus)
            .optional(),

        appointmentDate: z
            .iso
            .date()
            .optional(),

        fromDate: z
            .iso
            .date()
            .optional(),

        toDate: z
            .iso
            .date()
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
    })
    .strict()
    .superRefine((data, ctx) => {
        if (
            data.fromDate !== undefined &&
            data.toDate !== undefined &&
            data.fromDate > data.toDate
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['toDate'],
                message:
                    'To date must be after or equal to from date',
            });
        }
    });


/*
 * Appointment query.
 */
export const queryAppointmentSchema = querySchema
    .extend({
        search: z
            .string()
            .trim()
            .nonempty()
            .max(256)
            .optional(),

        filter: appointmentFilterSchema.optional(),

        sortBy: z
            .enum([
                SORT_BY_NAME,
                SORT_BY_SCHEDULED_START_AT_UTC,
                SORT_BY_SCHEDULED_END_AT_UTC,
                SORT_BY_CREATED_AT_UTC,
                SORT_BY_APPOINTMENT_STATUS,
                SORT_BY_PAYMENT_STATUS,
            ])
            .optional(),
    })
    .strict();