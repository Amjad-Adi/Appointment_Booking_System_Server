import {AppointmentStatus} from "./enums/appointment-status";

export const DEFAULT_COLOUR="#2563EB"
import {DataResponses} from "./query.model";
import {PaymentMethod} from "./enums/payment-method";
import {createServiceSchema, queryServiceSchema, updateServiceSchema} from "../middlewares/zod-schemas/service.schema";
import {
    confirmAppointmentSchema,
    createAppointmentSchema, payAppointmentSchema,
    queryAppointmentSchema, rejectAppointmentSchemaBy, updateAppointmentSchemaByOrganization,
    updateAppointmentSchemaByUser, updateAppointmentSchemaStatus
} from "../middlewares/zod-schemas/appointment.schema";
import {z} from "zod";
export interface Appointment{
    uuid:string,
    name:string
    userNote:string,
    organizationNote:string,
    createdAtUTC:Date,
    rejectionReason:string,
    scheduledStartTimeUTC:Date
    scheduledEndTimeUTC:Date,
    actualStartTimeUTC:Date,
    actualEndTimeUTC:Date,
    userColour:string,
    organizationColour:string,
    paymentMethod:PaymentMethod,
    paidAtUTC:Date,
    appointmentStatus:AppointmentStatus,
}

export interface AppointmentResponse extends Appointment,DataResponses{
    organizationUuid:string,
    organizationName:string,
    organizationEmail:string,
    organizationPhoneNumber:string,
    userUuid:string,
    userFirstName:string,
    userLastName:string,
    userEmail:string,
    userProfilePicturePath:string,
    approvalUserUuid:string,
    approvalUserFirstName:string,
    approvalUserLastName:string,
    approvalUserEmail:string,
    approvalUserPhoneNumber:string,
    approvalProfilePicturePath:string,
    roomUuid:string,
    roomName:string,
    serviceUuid:string,
    serviceName:string,
    servicePrice:number,
}


export type CreateAppointment= z.infer<typeof createAppointmentSchema> & {userUuid:string,userId:number,serviceUuid:string,serviceId:number,roomUuid:string,roomId:number;};
export type UpdateAppointmentByUser =z.infer<typeof updateAppointmentSchemaByUser> & {uuid:string,userUuid:string;};
export type UpdateAppointmentByOrganization= z.infer<typeof updateAppointmentSchemaByOrganization> & {uuid:string,userUuid:string,organizationUuid:string};
export type UpdateAppointmentStatus= z.infer<typeof updateAppointmentSchemaStatus> & {uuid:string,organizationUuid:string,userUuid:string;};
export type ConfirmAppointment= z.infer<typeof confirmAppointmentSchema> & {uuid:string,organizationUuid:string,approvalUserUuid:string;};
export type RejectAppointment= z.infer<typeof rejectAppointmentSchemaBy> & {uuid:string,organizationUuid:string,approvalUserUuid:string;};
export type PayAppointment= z.infer<typeof payAppointmentSchema> & {uuid:string,organizationUuid:string,userUuid:string;};
export type QueryAppointment=z.infer<typeof queryAppointmentSchema>&{offset:number};