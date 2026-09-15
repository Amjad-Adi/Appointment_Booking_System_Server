import { z } from "zod";

import {
    createAppointmentSchema,
    queryAppointmentSchema,
    updateAppointmentSchemaByOrganization,
    updateAppointmentSchemaByUser,
    updateAppointmentSchemaStatus,
    confirmAppointmentSchema,
    rejectAppointmentSchemaBy,
    payAppointmentSchema,
} from "../middlewares/zod-schemas/appointment.schema.js";

import { AppointmentStatus } from "./enums/appointment-status.js";
import { PaymentMethod } from "./enums/payment-method.js";
import { PaymentStatus } from "./enums/payment-status.js";
import { DataResponses } from "./query.model.js";

export interface Appointment {
    uuid: string;
    name: string;

    userUuid: string;
    organizationUuid: string;
    serviceUuid: string;
    workerUuid: string;
    roomUuid: string;
    approvalUserUuid: string | null;

    userTitle: string | null;
    organizationTitle: string | null;

    userNote: string | null;
    organizationNote: string | null;

    userColour: string;
    organizationColour: string;

    scheduledStartAtUTC: string;
    scheduledEndAtUTC: string;

    actualStartAtUTC: string | null;
    actualEndAtUTC: string | null;

    appointmentStatus: AppointmentStatus;

    rejectionReason: string | null;

    paymentMethod: PaymentMethod | null;
    paymentStatus: PaymentStatus;
    paidAtUTC: string | null;

    createdAtUTC: string;
    updatedAtUTC: string;
}

/**
 * Database representation returned directly by INSERT/UPDATE.
 *
 * This uses numeric database IDs rather than UUIDs because
 * Drizzle's returning() only returns columns from appointmentTable.
 */
export interface AppointmentRecord {
    uuid: string;
    name: string;

    userId: number;
    organizationId: number;
    serviceId: number;
    workerId: number;
    roomId: number;
    approvalUserId: number | null;

    userTitle: string | null;
    organizationTitle: string | null;

    userNote: string | null;
    organizationNote: string | null;

    userColour: string;
    organizationColour: string;

    scheduledStartAtUTC: string;
    scheduledEndAtUTC: string;

    actualStartAtUTC: string | null;
    actualEndAtUTC: string | null;

    appointmentStatus: AppointmentStatus;

    rejectionReason: string | null;

    paymentMethod: PaymentMethod | null;
    paymentStatus: PaymentStatus;
    paidAtUTC: string | null;

    createdAtUTC: string;
    updatedAtUTC: string;
}

export interface AppointmentResponse
    extends Appointment,
        DataResponses {
    userName: string;
    organizationName: string;
    serviceName: string;
    workerName: string;
    roomName: string;
    approvalUserName: string | null;
}

export type CreateAppointment =
    z.infer<typeof createAppointmentSchema> & {
    userId: number;
    organizationUuid: string;
    organizationId: number;
    serviceUuid: string;
    serviceId: number;
    workerUuid: string;
    workerId: number;
    roomUuid: string;
    roomId: number;
    name: string;
    scheduledEndTimeUTC: string;
};

export type UpdateAppointmentByUser =
    z.infer<typeof updateAppointmentSchemaByUser>;

export type UpdateAppointmentByOrganization =
    z.infer<typeof updateAppointmentSchemaByOrganization>;

export type UpdateAppointmentStatus =
    z.infer<typeof updateAppointmentSchemaStatus>;

export type ConfirmAppointment =
    z.infer<typeof confirmAppointmentSchema>;

export type RejectAppointment =
    z.infer<typeof rejectAppointmentSchemaBy>;

export type PayAppointment =
    z.infer<typeof payAppointmentSchema>;

export type QueryAppointment =
    z.infer<typeof queryAppointmentSchema> & {
    offset: number;
};