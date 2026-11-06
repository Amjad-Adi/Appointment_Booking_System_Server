"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAppointmentSchema = exports.appointmentFilterSchema = exports.payAppointmentSchema = exports.updateAppointmentSchemaStatus = exports.rejectAppointmentSchemaBy = exports.confirmAppointmentSchema = exports.updateAppointmentSchemaByOrganization = exports.updateAppointmentSchemaByUser = exports.createOrganizationAppointmentSchema = exports.createAppointmentSchema = void 0;
const zod_1 = require("zod");
const query_schema_js_1 = require("./query.schema.js");
const appointment_contract_js_1 = require("../../databases/contracts/appointment.contract.js");
const appointment_status_js_1 = require("../../models/enums/appointment-status.js");
const appointment_time_type_js_1 = require("../../models/enums/appointment-time-type.js");
const payment_method_js_1 = require("../../models/enums/payment-method.js");
const payment_status_js_1 = require("../../models/enums/payment-status.js");
const uuidSchema = zod_1.z.uuid('Invalid UUID');
const colourSchema = zod_1.z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid colour');
const appointmentNameSchema = zod_1.z
    .string()
    .trim()
    .min(1, 'Appointment name is required')
    .max(256, 'Appointment name must not exceed 256 characters');
const scheduledStartSchema = zod_1.z.iso.datetime({
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
exports.createAppointmentSchema = zod_1.z
    .object({
    userTitle: zod_1.z.string().min(1).optional(),
    serviceUuid: uuidSchema,
    timeType: zod_1.z.enum(appointment_time_type_js_1.AppointmentTimeType),
    workerUuid: uuidSchema,
    scheduledStartAtUTC: zod_1.z.string().datetime({ offset: true }),
    userNote: zod_1.z
        .string()
        .trim()
        .max(4096)
        .nullable()
        .optional(),
    userColour: colourSchema.optional(),
    paymentMethod: zod_1.z
        .enum(payment_method_js_1.PaymentMethod)
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
exports.createOrganizationAppointmentSchema = zod_1.z
    .object({
    organizationTitle: zod_1.z.string().min(1),
    userUuid: uuidSchema,
    serviceUuid: uuidSchema,
    workerUuid: uuidSchema,
    scheduledStartAtUTC: zod_1.z.string().datetime({ offset: true }),
    organizationNote: zod_1.z.string().optional(),
    organizationColour: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.enum(payment_method_js_1.PaymentMethod),
})
    .strict();
/*
 * USER updates their appointment.
 */
exports.updateAppointmentSchemaByUser = zod_1.z
    .object({
    userTitle: zod_1.z.string().min(1).optional(),
    userNote: zod_1.z
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
exports.updateAppointmentSchemaByOrganization = zod_1.z
    .object({
    organizationTitle: zod_1.z.string().min(1).optional(),
    organizationNote: zod_1.z
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
exports.confirmAppointmentSchema = zod_1.z
    .object({
    name: appointmentNameSchema,
    organizationColour: colourSchema.optional(),
    organizationNote: zod_1.z
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
exports.rejectAppointmentSchemaBy = zod_1.z
    .object({
    rejectionReason: zod_1.z
        .string()
        .trim()
        .min(1)
        .max(4096),
})
    .strict();
/*
 * Update appointment status.
 */
exports.updateAppointmentSchemaStatus = zod_1.z
    .object({
    appointmentStatus: zod_1.z
        .enum(appointment_status_js_1.AppointmentStatus)
        .refine((status) => status !==
        appointment_status_js_1.AppointmentStatus.PENDING_USER_CONFIRMATION &&
        status !==
            appointment_status_js_1.AppointmentStatus.PENDING_ORGANIZATION_APPROVAL &&
        status !== appointment_status_js_1.AppointmentStatus.REJECTED, {
        message: 'Invalid status transition',
    }),
})
    .strict();
/*
 * Pay appointment.
 */
exports.payAppointmentSchema = zod_1.z
    .object({
    paymentMethod: zod_1.z.enum(payment_method_js_1.PaymentMethod),
})
    .strict();
/*
 * Appointment filters.
 */
exports.appointmentFilterSchema = zod_1.z
    .object({
    organizationUuid: uuidSchema.optional(),
    appointmentStatus: zod_1.z
        .enum(appointment_status_js_1.AppointmentStatus)
        .optional(),
    appointmentDate: zod_1.z
        .iso
        .date()
        .optional(),
    fromDate: zod_1.z
        .iso
        .date()
        .optional(),
    toDate: zod_1.z
        .iso
        .date()
        .optional(),
    userUuid: uuidSchema.optional(),
    approvalUserUuid: uuidSchema.optional(),
    workerUuid: uuidSchema.optional(),
    serviceUuid: uuidSchema.optional(),
    roomUuid: uuidSchema.optional(),
    paymentMethod: zod_1.z
        .enum(payment_method_js_1.PaymentMethod)
        .optional(),
    paymentStatus: zod_1.z
        .enum(payment_status_js_1.PaymentStatus)
        .optional(),
})
    .strict()
    .superRefine((data, ctx) => {
    if (data.fromDate !== undefined &&
        data.toDate !== undefined &&
        data.fromDate > data.toDate) {
        ctx.addIssue({
            code: 'custom',
            path: ['toDate'],
            message: 'To date must be after or equal to from date',
        });
    }
});
/*
 * Appointment query.
 */
exports.queryAppointmentSchema = query_schema_js_1.querySchema
    .extend({
    search: zod_1.z
        .string()
        .trim()
        .nonempty()
        .max(256)
        .optional(),
    filter: exports.appointmentFilterSchema.optional(),
    sortBy: zod_1.z
        .enum([
        appointment_contract_js_1.SORT_BY_SCHEDULED_START_AT_UTC,
        appointment_contract_js_1.SORT_BY_SCHEDULED_END_AT_UTC,
        appointment_contract_js_1.SORT_BY_CREATED_AT_UTC,
    ])
        .optional(),
})
    .strict();
