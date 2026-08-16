import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {updateLocationSchema,createLocationSchema} from "../middlewares/schemas/location.schema"

export interface LocationResponse{
    name:string|null,
    readonly locationOnMap:[longitude:number|null,latitude:number|null],
    createdAtUTC:Date|null,
    updatedAtUTC:Date|null,
}

export interface Location{
    id:number
    name:string,
    readonly locationOnMap:[longitude:number,latitude:number],
    createdAtUTC:Date,
    updatedAtUTC:Date,
}
export type CreateLocation= z.infer<typeof createLocationSchema>;
export type UpdateLocation= z.infer<typeof updateLocationSchema> &{id:number};