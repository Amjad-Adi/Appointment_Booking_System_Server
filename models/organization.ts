import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/model-activation-status";
import {createOrganizationSchema,updateOrganizationSchema,updateOrganizationByAdminSchema} from "../middlewares/schemas/organization-schema"
import {createLocationSchema} from "../middlewares/schemas/location-schema";
import {LocationResponse} from "./location";
export interface Organization{
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
    locationUUID: string;
    locationName: string;
    longitude: number;
    latitude: number;
    locationCreatedAtUTC: Date;
    locationUpdatedAtUTC: Date;
    createdAtUTC: Date;
    updatedAtUTC: Date;
    status: ActivationStatus;
}
export type CreateOrganization= z.infer<typeof createOrganizationSchema>;
export type UpdateOrganization= z.infer<typeof updateOrganizationSchema>;
export type UpdateOrganizationByAdmin= z.infer<typeof updateOrganizationByAdminSchema>;
