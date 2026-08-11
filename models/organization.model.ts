import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {createOrganizationSchema,updateOrganizationSchema,updateOrganizationByAdminSchema} from "../middlewares/schemas/organization.schema"
import {createLocationSchema} from "../middlewares/schemas/location.schema";
import {LocationResponse} from "./location.model";
export interface Organization {
    uuid:string,
    name:string
    email:string,
    phoneNumber:string,
    bio:string,
    location:number,
    profilePicturePath:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
}
export interface OrganizationResponse{
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
    locationUuid: string|null;
    locationName: string|null;
    longitude: number|null;
    latitude: number|null;
    locationCreatedAtUTC: Date|null;
    locationUpdatedAtUTC: Date|null;
    createdAtUTC: Date;
    updatedAtUTC: Date;
    status: ActivationStatus;
}
export type CreateOrganization= z.infer<typeof createOrganizationSchema> & {organizationManagerUuid:string};
export type UpdateOrganization= z.infer<typeof updateOrganizationSchema> & {uuid:string};
export type UpdateOrganizationByAdmin= z.infer<typeof updateOrganizationByAdminSchema> & {uuid:string};
