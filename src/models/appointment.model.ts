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


export interface UserAppointment {
    uuid: string;

    userTitle: string | null;
    userNote: string | null;
    userColour: string;

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


export interface OrganizationAppointment {
    uuid: string;

    organizationTitle: string | null;
    organizationNote: string | null;
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
 * ORGANIZATION-SIDE appointment response.
 *
 * Contains the appointment's related entities
 * as both UUIDs and display names.
 */
export interface OrganizationAppointmentResponse
    extends OrganizationAppointment {
    userUuid: string;
    userName: string;

    organizationUuid: string;
    organizationName: string;

    serviceUuid: string;
    serviceName: string;

    workerUuid: string;
    workerName: string;

    roomUuid: string;
    roomName: string;

    approvalUserUuid: string | null;
    approvalUserName: string | null;
}


/**
 * USER-SIDE appointment response.
 *
 * Organization-private fields are intentionally omitted.
 *
 * The user does not receive:
 * - organizationName
 * - organizationTitle
 * - organizationNote
 * - organizationColour
 * - approvalUserUuid
 * - approvalUserName
 *
 * Related entities that are visible to the user include
 * their UUID and display name.
 */
export interface UserAppointmentResponse
    extends UserAppointment {
    userUuid: string;
    userName: string;

    organizationUuid: string;
    organizationName: string;
    serviceUuid: string;
    serviceName: string;

    workerUuid: string;
    workerName: string;

    roomUuid: string;
    roomName: string;
}


/**
 * CUSTOMER / USER creates an appointment.
 *
 * The service layer resolves:
 * - organizationUuid -> organizationId
 * - serviceUuid -> serviceId
 * - workerUuid -> workerId
 * - roomUuid -> roomId
 *
 * scheduledEndAtUTC is also resolved by the service layer.
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
 *
 * The service layer resolves:
 * - organizationUuid -> organizationId
 * - userUuid -> userId
 * - serviceUuid -> serviceId
 * - workerUuid -> workerId
 * - roomUuid -> roomId
 *
 * scheduledEndAtUTC is resolved by the service layer.
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
