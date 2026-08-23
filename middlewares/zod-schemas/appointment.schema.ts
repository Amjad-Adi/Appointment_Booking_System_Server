import {z} from "zod"
import {PaymentMethod} from "../../models/enums/payment-method";
import {DEFAULT_COLOUR} from "../../models/appointment.model";
import {AppointmentStatus} from "../../models/enums/appointment-status";
import {ActivationStatus} from "../../models/enums/activation-status";
import {querySchema} from "./query.schema";
import {
    SORT_BY_PAID_AT_UTC,
    SORT_BY_SCHEDULED_END_AT_UTC, SORT_BY_SCHEDULED_START_AT_UTC, SORT_BY_TITLE
} from "../../databases/contracts/appointment.contract";
import {PaymentStatus} from "../../models/enums/payment-status";

const dateTimeSchema=z.iso.datetime({offset:true}).transform((dateTime)=>new Date(dateTime))

export const createAppointmentSchemaByUser=z.object({
    userTitle:z.string().trim().nonempty().max(256),
    userNote:z.string().trim().max(4096).nonempty().optional(),
    scheduledStartAtUTC:dateTimeSchema,
    scheduledEndAtUTC:dateTimeSchema,
    userColour:z.string().regex(/^#[a-f0-9]{6}$/i,
        {message: 'Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).'}).default(DEFAULT_COLOUR),
    //checks user colour against hex format, i flag used for insensitivity
    paymentMethod:z.enum(PaymentMethod),
}).strict()

export const createAppointmentSchemaByOrganizatiton=z.object({
    organizationTitle:z.string().trim().nonempty().max(256),
    organizationNote:z.string().trim().max(4096).nonempty().optional(),
    scheduledStartAtUTC:dateTimeSchema,
    scheduledEndAtUTC:dateTimeSchema,
    organizationColour:z.string().regex(/^#[a-f0-9]{6}$/i,
        {message: 'Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).'}).default(DEFAULT_COLOUR),
    //checks user colour against hex format, i flag used for insensitivity
    paymentMethod:z.enum(PaymentMethod),
}).strict()

export const updateAppointmentSchemaByUser=z.object({
    userTitle:z.string().trim().nonempty().max(256).optional(),
    userNote:z.string().trim().nonempty().max(4096).optional(),
    userColour:z.string().regex(/^#[a-f0-9]{6}$/i,
        {message: 'Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).'}).default(DEFAULT_COLOUR),
    paymentMethod: z.enum(PaymentMethod),
}).strict()

export const updateAppointmentSchemaByOrganization=z.object({
    organizationTitle:z.string().trim().nonempty().max(256).optional(),
    organizationNote:z.string().trim().nonempty().max(4096).optional(),
    organizationColour:z.string().regex(/^#[a-f0-9]{6}$/i,
        {message: 'Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).'}).default(DEFAULT_COLOUR),
    rejectionReason:z.string().trim().nonempty().max(4096),
    paymentMethod: z.enum(PaymentMethod),
    appointmentStatus:z.enum(AppointmentStatus)
}).strict()

export const appointmentFilterSchema = z.object({
    appointmentStatus:z.enum(AppointmentStatus).optional(),
    fromDate:dateTimeSchema.optional(),
    toDate:dateTimeSchema.optional(),
    employeeUuid:z.uuid().optional(),
    serviceUuid:z.uuid().optional(),
    roomUuid:z.uuid().optional(),
    paymentMethod:z.enum(PaymentMethod).optional(),
    paymentStatus:z.enum(PaymentStatus).optional(),
}).strict();


export const appointmentFilterSchemaByUser =appointmentFilterSchema.extend({
    organizationUuid:z.uuid().optional(),
}).strict();


export const appointmentFilterSchemaByOrganization =appointmentFilterSchema.extend({
    userUuid:z.uuid().optional(),
    approvalUserUuid:z.uuid().optional(),
}).strict();

export const queryAppointmentSchemaByUser = querySchema.extend({
    search: z.string().trim().nonempty().max(256).optional(),
    filter: appointmentFilterSchemaByUser.optional(),
    sortBy: z.enum([SORT_BY_TITLE, SORT_BY_SCHEDULED_START_AT_UTC,SORT_BY_SCHEDULED_END_AT_UTC,SORT_BY_PAID_AT_UTC]).optional(),
}).strict();


export const queryAppointmentSchemaByOrganization = querySchema.extend({
    search: z.string().trim().nonempty().max(256).optional(),
    filter: appointmentFilterSchemaByOrganization.optional(),
    sortBy: z.enum([SORT_BY_TITLE, SORT_BY_SCHEDULED_START_AT_UTC,SORT_BY_SCHEDULED_END_AT_UTC,SORT_BY_PAID_AT_UTC]).optional(),
}).strict();