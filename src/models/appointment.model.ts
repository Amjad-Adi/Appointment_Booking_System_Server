import { z } from "zod";

import {
    createAppointmentSchema,
    createOrganizationAppointmentSchema,
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


/**
 * CUSTOMER / USER creates an appointment.
 *
 * UUIDs come from the request.
 * Numeric IDs and scheduledEndAtUTC are resolved
 * by the service layer.
 */
export type CreateAppointment =
    Omit<
        z.infer<typeof createAppointmentSchema>,
        "scheduledStartAtUTC"
    > & {
    userId: number;

    organizationUuid: string;
    organizationId: number;

    serviceId: number;
    workerId: number;
    roomId: number;

    scheduledStartAtUTC: Date;
    scheduledEndAtUTC: Date;
};


/**
 * ORGANIZATION creates an appointment.
 */
export type CreateOrganizationAppointment =
    Omit<
        z.infer<typeof createOrganizationAppointmentSchema>,
        "scheduledStartAtUTC"
    > & {
    organizationUuid: string;
    organizationId: number;

    userId: number;

    serviceId: number;
    workerId: number;
    roomId: number;

    scheduledStartAtUTC: Date;
    scheduledEndAtUTC: Date;
};


export type UpdateAppointmentByUser =
    z.infer<typeof updateAppointmentSchemaByUser> & {
    uuid: string;
    userUuid: string;
};


export type UpdateAppointmentByOrganization =
    z.infer<typeof updateAppointmentSchemaByOrganization> & {
    uuid: string;
    organizationUuid: string;
    userUuid: string;
};


export type UpdateAppointmentStatus =
    z.infer<typeof updateAppointmentSchemaStatus> & {
    uuid: string;
    organizationUuid: string;
    userUuid: string;
};


export type ConfirmAppointment =
    z.infer<typeof confirmAppointmentSchema> & {
    uuid: string;
    organizationUuid: string;
    userUuid: string;
};


export type RejectAppointment =
    z.infer<typeof rejectAppointmentSchemaBy> & {
    uuid: string;
    organizationUuid: string;
    userUuid: string;
};


export type PayAppointment =
    z.infer<typeof payAppointmentSchema> & {
    uuid: string;
    organizationUuid: string;
    userUuid: string;
};


export type QueryAppointment =
    z.infer<typeof queryAppointmentSchema> & {
    offset: number;
};


export const ACTIVE_APPOINTMENT_STATUSES = [
    AppointmentStatus.PENDING_USER_CONFIRMATION,
    AppointmentStatus.PENDING_ORGANIZATION_APPROVAL,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.IN_PROGRESS,
];