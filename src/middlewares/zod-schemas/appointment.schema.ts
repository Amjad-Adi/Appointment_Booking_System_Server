import {z} from "zod"
import {PaymentMethod} from "../../models/enums/payment-method.js";
import {DEFAULT_COLOUR} from "../../models/appointment.model.js";
import {AppointmentStatus} from "../../models/enums/appointment-status.js";
import {ActivationStatus} from "../../models/enums/activation-status.js";
import {querySchema} from "./query.schema.js";
import {
    SORT_BY_NAME,
    SORT_BY_PAID_AT_UTC,
    SORT_BY_SCHEDULED_END_AT_UTC, SORT_BY_SCHEDULED_START_AT_UTC
} from "../../databases/contracts/appointment.contract.js";
import {AppointmentTimeType} from "../../models/enums/appointment-time-type.js";
import {PaymentStatus} from "../../models/enums/payment-status.js";

export const createAppointmentSchema=z.object({
    userNote:z.string().trim().max(4096).nonempty().optional(),
    scheduledStartTimeUTC:z.iso.datetime({offset:true}),
    scheduledEndTimeUTC:z.iso.datetime({offset:true}),
    userColour:z.string().regex(/^#[a-f0-9]{6}$/i,
        {message: 'Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).'}).default(DEFAULT_COLOUR),
    //checks user colour against hex format, i flag used for insensitivity
    paymentMethod:z.enum(PaymentMethod),
}).strict()

export const updateAppointmentSchemaByUser=z.object({
    userNote:z.string().trim().nonempty().max(4096).optional(),
    userColour:z.string().regex(/^#[a-f0-9]{6}$/i,
        {message: 'Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).'}).default(DEFAULT_COLOUR),
}).strict()

export const updateAppointmentSchemaByOrganization=z.object({
    organizationNote:z.string().trim().nonempty().max(4096).optional(),
    organizationColour:z.string().regex(/^#[a-f0-9]{6}$/i,
        {message: 'Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).'}).default(DEFAULT_COLOUR),
}).strict()

export const confirmAppointmentSchema=z.object({
    name:z.string().trim().nonempty().max(256),
    organizationColour:z.string().regex(/^#[a-f0-9]{6}$/i,
        {message: 'Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).'}).default(DEFAULT_COLOUR),
    organizationNote:z.string().trim().nonempty().max(4096).optional()
}).strict()

export const rejectAppointmentSchemaBy=z.object({
    rejectionReason:z.string().trim().nonempty().max(4096),
}).strict()

export const updateAppointmentSchemaStatus=z.object({
    appointmentStatus:z.enum(AppointmentStatus).refine((status)=>(status!=AppointmentStatus.PENDING&&status!=AppointmentStatus.REJECTED)),
}).strict()

export const payAppointmentSchema=z.object({
    paymentMethod: z.enum(PaymentMethod),
}).strict()


export const appointmentFilterSchema = z.object({
    appointmentStatus:z.enum(ActivationStatus).optional(),
    appointmentDate:z.iso.date().optional(),
    appointmentTimeType:z.enum(AppointmentTimeType).optional(),
    fromDate:z.iso.date().optional(),
    toDate:z.iso.date().optional(),
    userUuid:z.uuid().optional(),
    approvalUserUuid:z.uuid().optional(),
    employeeUuid:z.uuid().optional(),
    serviceUuid:z.uuid().optional(),
    roomUuid:z.uuid().optional(),
    paymentMethod:z.enum(PaymentMethod),
    paymentStatus:z.enum(PaymentStatus),
}).strict();

export const queryAppointmentSchema = querySchema.extend({
    search: z.string().trim().nonempty().max(256).optional(),
    filter: appointmentFilterSchema.optional(),
    sortBy: z.enum([SORT_BY_NAME, SORT_BY_SCHEDULED_START_AT_UTC,SORT_BY_SCHEDULED_END_AT_UTC,SORT_BY_PAID_AT_UTC]).optional(),
}).strict();