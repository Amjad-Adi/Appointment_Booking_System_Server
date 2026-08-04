import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/model-activation-status";
import {updateLocationSchema,createLocationSchema} from "../middlewares/schemas/location-schema"

export interface LocationResponse{
    uuid:string,
    name:string,
    readonly locationOnMap:[longitude:number,latitude:number],
    createdAtUTC:Date,
    updatedAtUTC:Date,
}

export interface Location{
    id:number,
    uuid:string,
    name:string,
    readonly locationOnMap:[longitude:number,latitude:number],
    createdAtUTC:Date,
    updatedAtUTC:Date,
}
export type CreateLocation= z.infer<typeof createLocationSchema>;
export type UpdateLocation= z.infer<typeof updateLocationSchema>;