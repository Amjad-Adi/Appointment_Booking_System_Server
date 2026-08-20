import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {createTimeBlockSchema, updateTimeBlockSchema} from "../middlewares/zod-schemas/time-block.schema";
import {TimeBlockStatus} from "./enums/time-block-status";
import {Service} from "./service.model";
export interface TimeBlock {
    uuid:string,
    reason:string|null,
    startAt:string,
    endAt:string,
    requestedAtUTC:Date,
    respondedAtUTC:Date|null,
    requestStatus:TimeBlockStatus
}


export interface TimeBlockResponse extends TimeBlock {
    requestUserUuid:string|null,
    requestUserFirstName:string,
    requestUserLastName:string,
    requestUserProfilePicturePath:string|null,
    respondUserUuid:string|null,
    respondUserFirstName:string|null,
    respondUserLastName:string|null,
    respondUserProfilePicturePath:string|null,
}

export type CreateTimeBlock= z.infer<typeof createTimeBlockSchema> & {requestUserUuid:string,requestUserId:number,organizationUuid:string};
export type UpdateTimeBlock= z.infer<typeof updateTimeBlockSchema>& {uuid:string,respondUserUuid:string,respondUserId:number,organizationUuid:string};