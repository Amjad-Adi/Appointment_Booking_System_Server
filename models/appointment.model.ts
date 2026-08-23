import {AppointmentStatus} from "./enums/appointment-status";

export const DEFAULT_COLOUR="#2563EB"
import {DataResponses} from "./query.model";
import {PaymentMethod} from "./enums/payment-method";
import {createServiceSchema, queryServiceSchema, updateServiceSchema} from "../middlewares/zod-schemas/service.schema";
import {
    confirmAppointmentSchema,
    createAppointmentSchemaByOrganizatiton,
    createAppointmentSchemaByUser,
    payAppointmentSchema,
    queryAppointmentSchemaByOrganization,
    queryAppointmentSchemaByUser,
    rejectAppointmentSchemaBy,
    updateAppointmentSchemaByOrganization,
    updateAppointmentSchemaByUser,
    updateAppointmentSchemaStatus
} from "../middlewares/zod-schemas/appointment.schema";
import {z} from "zod";
export interface Appointment{
    uuid:string,
    userTitle:string|null,
    organizationTitle:string|null,
    userNote:string|null,
    organizationNote:string|null,
    createdAtUTC:Date,
    rejectionReason:string|null,
    scheduledStartAtUTC:Date
    scheduledEndAtUTC:Date,
    actualStartAtUTC:Date|null,
    actualEndAtUTC:Date|null,
    userColour:string,
    organizationColour:string,
    paymentMethod:PaymentMethod,
    paidAtUTC:Date|null,
    appointmentStatus:AppointmentStatus,
}


export interface UserAppointment{
    uuid:string,
    userTitle:string|null,
    userNote:string|null,
    createdAtUTC:Date,
    rejectionReason:string|null,
    scheduledStartAtUTC:Date
    scheduledEndAtUTC:Date,
    actualStartAtUTC:Date|null,
    actualEndAtUTC:Date|null,
    userColour:string,
    paymentMethod:PaymentMethod,
    paidAtUTC:Date|null,
    appointmentStatus:AppointmentStatus,
}


export interface OrganizationAppointment{
    uuid:string,
    organizationTitle:string|null,
    organizationNote:string|null,
    createdAtUTC:Date,
    rejectionReason:string|null,
    scheduledStartAtUTC:Date
    scheduledEndAtUTC:Date,
    actualStartAtUTC:Date|null,
    actualEndAtUTC:Date|null,
    organizationColour:string,
    paymentMethod:PaymentMethod,
    paidAtUTC:Date|null,
    appointmentStatus:AppointmentStatus,
}

export interface AppointmentResponse{
    userUuid:string,
    userFirstName:string,
    userLastName:string,
    userEmail:string,
    userProfilePicturePath:string,
    employeeUuid:string|null,
    employeeFirstName:string|null,
    employeeLastName:string|null,
    employeeEmail:string|null,
    employeeProfilePicturePath:string|null,
    roomUuid:string|null,
    roomName:string|null,
    serviceUuid:string,
    serviceName:string,
    servicePrice:number,
    serviceDurationInMinutes:number,
}

export interface AppointmentUserResponse extends AppointmentResponse,UserAppointment,DataResponses{
    organizationUuid:string,
    organizationName:string,
    organizationEmail:string,
    organizationPhoneNumber:string|null,
}


export interface AppointmentOrganizationResponse extends AppointmentResponse,OrganizationAppointment,DataResponses{
    approvalUserUuid:string|null,
    approvalUserFirstName:string|null,
    approvalUserLastName:string|null,
    approvalUserEmail:string|null,
    approvalUserProfilePicturePath:string|null,
}


export type CreateAppointmentByUser= z.infer<typeof createAppointmentSchemaByUser> & {userUuid:string,userId:number,serviceUuid:string,serviceId:number,roomUuid:string,roomId:number};
export type CreateAppointmentByOrganization= z.infer<typeof createAppointmentSchemaByOrganizatiton> & {userEmail:string,userId:number,serviceUuid:string,serviceId:number,roomUuid:string,roomId:number,approvalUserId:number,approvalUserUuid:string,};
export type UpdateAppointmentByUser =z.infer<typeof updateAppointmentSchemaByUser> & {uuid:string,userUuid:string;};
export type UpdateAppointmentByOrganization= z.infer<typeof updateAppointmentSchemaByOrganization> & {uuid:string,userUuid:string,organizationUuid:string};
export type UpdateAppointmentStatus= z.infer<typeof updateAppointmentSchemaStatus> & {uuid:string,organizationUuid:string,userUuid:string;};
export type ConfirmAppointment= z.infer<typeof confirmAppointmentSchema> & {uuid:string,organizationUuid:string,approvalUserUuid:string;};
export type RejectAppointment= z.infer<typeof rejectAppointmentSchemaBy> & {uuid:string,organizationUuid:string,approvalUserUuid:string;};
export type PayAppointment= z.infer<typeof payAppointmentSchema> & {uuid:string,organizationUuid:string,userUuid:string;};
export type QueryAppointmentByUser=z.infer<typeof queryAppointmentSchemaByUser>&{offset:number};
export type QueryAppointmentByOrganization=z.infer<typeof queryAppointmentSchemaByOrganization>&{offset:number};