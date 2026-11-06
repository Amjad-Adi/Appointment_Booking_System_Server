import {Role} from "./enums/roles";
import {ActivationStatus} from "./enums/activation-status";
import {
    createOrganizationSchema,
    updateOrganizationSchema,
    updateOrganizationByAdminSchema,
    queryOrganizationSchema, createOrganizationByAdminSchema
} from "../middlewares/zod-schemas/organization.schema"
import {createLocationSchema} from "../middlewares/zod-schemas/location.schema";
import {LocationResponse} from "./location.model";
import { z } from 'zod';
import { updateUserByAdminSchema, updateUserSchema } from '../middlewares/zod-schemas/user.schema';
import { DataResponses } from './query.model';
export interface Organization {
    uuid:string,
    name:string
    email:string,
    phoneNumber:string,
    bio:string,
    locationId:number,
    profilePicturePath:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
}
export interface OrganizationResponse extends DataResponses{
    uuid:string,
    name:string
    email:string,
    phoneNumber:string,
    bio:string,
    location:LocationResponse,
    profilePicturePath:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
}
export interface OrganizationRow {
    uuid: string;
    name: string;
    email: string;
    phoneNumber: string;
    bio: string;
    profilePicturePath: string;
    locationName: string|null;
    timezone:string;
    longitude: number|null;
    latitude: number|null;
    locationCreatedAtUTC: Date|null;
    locationUpdatedAtUTC: Date|null;
    createdAtUTC: Date;
    updatedAtUTC: Date;
    status: ActivationStatus;
}
export type CreateOrganization= z.infer<typeof createOrganizationSchema> & {organizationOwnerUuid:string,profilePicturePath?:string,profilePictureId?:string}
export type UpdateOrganizationByUser = z.infer<typeof updateOrganizationSchema>& {uuid:string ,userUuid:string,profilePicturePath?:string,profilePictureId?:string}
export type UpdateOrganizationByAdmin= z.infer<typeof updateOrganizationByAdminSchema> & {uuid:string; profilePicturePath?:string; profilePictureId?:string};
const combinedUpdateOrganizationSchema = updateOrganizationByAdminSchema.extend(updateOrganizationSchema.shape).partial({ status: true })
;export type UpdateOrganization = z.infer<typeof combinedUpdateOrganizationSchema>&{ uuid: string; profilePicturePath?: string; profilePictureId?: string; };
export type QueryOrganization = z.infer<typeof queryOrganizationSchema> & { offset: number; };
export type CreateOrganizationByAdmin = z.infer<typeof createOrganizationByAdminSchema> & {profilePicturePath?:string; profilePictureId?:string};