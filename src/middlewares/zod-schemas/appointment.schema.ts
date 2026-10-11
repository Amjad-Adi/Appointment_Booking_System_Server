import { z } from "zod";
import { querySchema } from "./query.schema";
import { SORT_BY_SCHEDULED_START_AT_UTC, SORT_BY_SCHEDULED_END_AT_UTC, SORT_BY_CREATED_AT_UTC, } from "../../databases/contracts/appointment.contract";
import { AppointmentStatus } from "../../models/enums/appointment-status";
import { AppointmentTimeType } from "../../models/enums/appointment-time-type";
import { PaymentMethod } from "../../models/enums/payment-method";
import { PaymentStatus } from "../../models/enums/payment-status";

export const createAppointmentSchema = z.object({
        userTitle: z.string().trim().min(1, "Appointment name is required").max(256, "Appointment name must not exceed 256 characters"),
        serviceUuid: z.uuid("Invalid UUID"),
        timeType: z.enum(AppointmentTimeType),
        workerUuid:z.uuid("Invalid UUID"),
        scheduledStartAtUTC: z.iso.datetime({ offset: true}),
        userNote: z.string().trim().max(4096, "Note must not exceed 4096 characters").nullable().optional(),
        userColour:  z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid colour").optional(),
        paymentMethod: z.enum(PaymentMethod).nullable().optional(),
}).strict();

export const createOrganizationAppointmentSchema = z.object({
        organizationTitle:z.string().trim().min(1, "Appointment name is required").max(256, "Appointment name must not exceed 256 characters"),
        userUuid:z.uuid("Invalid UUID"),
        serviceUuid: z.uuid("Invalid UUID"),
        workerUuid:z.uuid("Invalid UUID"),
        scheduledStartAtUTC:  z.iso.datetime({ offset: true}),
        organizationNote: z.string().trim().max(4096, "Note must not exceed 4096 characters").nullable().optional(),
        organizationColour:  z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid colour").optional(),
        paymentMethod: z.enum(PaymentMethod).optional(),
}).strict();

export const updateAppointmentSchemaByUser = z.object({
        userTitle:z.string().trim().min(1, "Appointment name is required").max(256, "Appointment name must not exceed 256 characters").optional(),
        userNote:z.string().trim().max(4096, "Note must not exceed 4096 characters").nullable().optional(),
        userColour:  z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid colour").optional(),
}).strict().refine((data) => Object.values(data).some((value) => value !== undefined), {message: "At least one field must be provided" },);

export const updateAppointmentSchemaByOrganization = z.object({
    organizationTitle: z.string().trim().min(1, "Appointment name is required").max(256, "Appointment name must not exceed 256 characters").optional(),
    organizationNote: z.string().trim().max(4096, "Note must not exceed 4096 characters").nullable().optional(),
    organizationColour: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid colour").optional(),
    appointmentStatus: z.enum(AppointmentStatus).optional(),
    rejectionReason: z.string().trim().min(1, "Rejection reason is required").max(4096, "Rejection reason must not exceed 4096 characters").optional(),
    paymentMethod: z.enum(PaymentMethod).optional(),
    paymentStatus: z.enum(PaymentStatus).optional(),
}).strict().refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided",
}).superRefine((data, ctx) => {
    if (data.appointmentStatus === AppointmentStatus.REJECTED && data.rejectionReason === undefined) {
        ctx.addIssue({
            code: "custom",
            path: ["rejectionReason"],
            message: "Rejection reason is required",
        });
    }
    if (data.appointmentStatus !== AppointmentStatus.REJECTED && data.rejectionReason !== undefined) {
        ctx.addIssue({
            code: "custom",
            path: ["rejectionReason"],
            message: "Rejection reason is only allowed when rejecting an appointment",
        });
    }

});
export const appointmentFilterSchema = z.object({
        organizationUuid: z.uuid("Invalid UUID").optional(),
        appointmentStatus: z.enum(AppointmentStatus).optional(),
        appointmentDate: z.iso.date().optional(),
        fromDate: z.iso.date().optional(),
        toDate: z.iso.date().optional(),
        userUuid: z.uuid("Invalid UUID").optional(),
        approvalUserUuid:  z.uuid("Invalid UUID").optional(),
        workerUuid:  z.uuid("Invalid UUID").optional(),
        serviceUuid:  z.uuid("Invalid UUID").optional(),
        roomUuid:  z.uuid("Invalid UUID").optional(),
        paymentMethod: z.enum(PaymentMethod).optional(),
        paymentStatus: z.enum(PaymentStatus).optional(),
}).strict().superRefine((data, ctx) => {
        if (data.fromDate !== undefined && data.toDate !== undefined && data.fromDate > data.toDate) {
            ctx.addIssue({
                code: "custom",
                path: ["toDate"],
                message: "To date must be after or equal to from date",
            });
        }
        if (data.appointmentDate !== undefined && (data.fromDate !== undefined || data.toDate !== undefined)) {
            ctx.addIssue({
                code: "custom",
                path: ["appointmentDate"],
                message: "Use appointmentDate or a fromDate/toDate range, not both",
            });
        }
});

export const queryAppointmentSchema = querySchema.extend({
        search: z.string().trim().min(1).max(256).optional(),
        filter: appointmentFilterSchema.optional(),
        sortBy: z.enum([SORT_BY_SCHEDULED_START_AT_UTC, SORT_BY_SCHEDULED_END_AT_UTC, SORT_BY_CREATED_AT_UTC,]).optional(),
}).strict();
