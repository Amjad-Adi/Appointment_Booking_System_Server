import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status.js";
import {createServiceSchema, queryServiceSchema, updateServiceSchema} from "../middlewares/zod-schemas/service.schema.js"
import {DataResponses} from "./query.model.js";
export interface Service{
    uuid:string,
    name:string
    description:string,
    price:number,
    durationInMinutes:string,
    servicePicturePath:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
}

export interface ServiceResponse extends Service,DataResponses{
    organizationUuid:string,
    organizationName:string,
    profilePicturePath:string,
}

export type OrganizationServiceResponseService=Service;
export type CreateService= z.infer<typeof createServiceSchema> & {organizationUuid:string,organizationId:number;};
export type UpdateService= z.infer<typeof updateServiceSchema> & {uuid:string,organizationUuid:string,userUuid:string;};
export type QueryService=z.infer<typeof queryServiceSchema>&{offset:number};