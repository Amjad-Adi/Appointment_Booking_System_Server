import type { z } from "zod";
import type {
    createAppointmentSchema,
    createOrganizationAppointmentSchema,
    updateAppointmentSchemaByUser,
    updateAppointmentSchemaByOrganization,
    queryAppointmentSchema,
} from "../middlewares/zod-schemas/appointment.schema";
import { AppointmentStatus } from "./enums/appointment-status";
import { PaymentMethod } from "./enums/payment-method";
import { PaymentStatus } from "./enums/payment-status";

interface Appointment {
    uuid: string;
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

export interface UserAppointmentResponse extends Appointment {
    userTitle: string | null;
    userNote: string | null;
    userColour: string | null;
}

export interface OrganizationAppointmentResponse extends Appointment {
    approvalUserUuid: string | null;
    approvalUserName: string | null;
    organizationTitle: string | null;
    organizationNote: string | null;
    organizationColour: string | null;
}

export type CreateAppointment = z.infer<typeof createAppointmentSchema> & {
    organizationUuid: string;
};

export type CreateOrganizationAppointment = z.infer<typeof createOrganizationAppointmentSchema> & {
    organizationUuid: string;
};

export type UpdateAppointmentByUser = z.infer<typeof updateAppointmentSchemaByUser>;

export type UpdateAppointmentByOrganization = z.infer<typeof updateAppointmentSchemaByOrganization>;

export type UpdateAppointmentByUserValues = Partial<Pick<UpdateAppointmentByUser, "userTitle" | "userNote" | "userColour">>;

export type UpdateAppointmentByOrganizationValues = Partial<Pick<
    UpdateAppointmentByOrganization,
    "organizationTitle" | "organizationNote" | "organizationColour" | "paymentMethod" | "paymentStatus"
>> & {
    appointmentStatus?: AppointmentStatus;
    rejectionReason?: string | null;
};

export type QueryAppointment = z.infer<typeof queryAppointmentSchema> & {
    offset: number;
};

export const ACTIVE_APPOINTMENT_STATUSES = [
    AppointmentStatus.PENDING_USER_CONFIRMATION,
    AppointmentStatus.PENDING_ORGANIZATION_APPROVAL,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.IN_PROGRESS,
];