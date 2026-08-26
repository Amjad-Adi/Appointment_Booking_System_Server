import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status.js";
import {InvitationStatus} from "./enums/invitation-status.js";
import {createServiceSchema,updateServiceSchema} from "../middlewares/zod-schemas/service.schema.js"
import {
    createInvitationSchema,
    updateInvitationSchema
} from "../middlewares/zod-schemas/invitations.schema.js";
export interface Invitation{
    uuid:string,
    createdAtUTC:Date,
    expiredAtUTC:Date,
    invitationStatus:InvitationStatus
}


export interface InvitationResponse extends Invitation{
    senderUuid:string,
    senderFirstName:string,
    senderLastName:string,
    senderEmail:string,
    senderProfilePicturePath:string,
    organizationUuid:string,
    organizationName:string,
    recipientUuid:string,
    recipientFirstName:string,
    recipientLastName:string,
    recipientEmail:string,
    recipientProfilePicturePath:string,
}

export type CreateInvitation= z.infer<typeof createInvitationSchema> & {organizationId:number,senderId:number};
export type UpdateInvitation= z.infer<typeof updateInvitationSchema> & {uuid:string,organizationUuid:string,userUuid:string};