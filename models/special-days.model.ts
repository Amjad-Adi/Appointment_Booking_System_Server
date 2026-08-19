import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {createSpecialDaysSchema, updateSpecialDaysSchema} from "../middlewares/zod-schemas/special-days.schema";
export interface SpecialDay {
    uuid:string,
    name:string
    description:string|null,
    dayDate:string
    createdAtUTC:Date,
    updatedAtUTC:Date,
    status:ActivationStatus
}

export type CreateSpecialDay= z.infer<typeof createSpecialDaysSchema> & {organizationUuid:string,organizationId:number,userUuid:string};
export type UpdateSpecialDay= z.infer<typeof updateSpecialDaysSchema> & {uuid:string,organizationUuid:string,userUuid:string};