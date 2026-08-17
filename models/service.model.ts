import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {createServiceSchema,updateServiceSchema} from "../middlewares/zod-schemas/service.schema"
import {RoomResponse} from "./room.model";
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

export interface ServiceResponse extends Service{
    organizationUuid:string,
    organizationName:string,
    profilePicturePath:string,
}

export type OrganizationServiceResponseService=Service;
export type CreateService= z.infer<typeof createServiceSchema> & {organizationUuid:string,organizationId:number;};
export type UpdateService= z.infer<typeof updateServiceSchema> & {uuid:string};