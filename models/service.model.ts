import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {createServiceSchema,updateServiceSchema} from "../middlewares/schemas/service.schema"
import {createLocationSchema} from "../middlewares/schemas/location.schema";
import {LocationResponse} from "./location.model";
export interface Service{
    uuid:string,
    name:string
    description:string,
    price:number,
    durationInMinutes:string,
    organizationId:string,
    servicePicturePath:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
}

export interface ServiceResponse{
    uuid:string,
    name:string
    description:string,
    price:number,
    durationInMinutes:string,
    organizationUuid:string,
    organizationName:string,
    profilePicturePath:string,
    servicePicturePath:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
}
export type CreateService= z.infer<typeof createServiceSchema> & {organizationUuid:string,organizationId:number;};
export type UpdateService= z.infer<typeof updateServiceSchema> & {uuid:string};