import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {InvitationStatus} from "./enums/invitation-status";
import {createServiceSchema,updateServiceSchema} from "../middlewares/schemas/service.schema"
import {
    createInvitationSchema,
    updateInvitationSchema
} from "../middlewares/schemas/invitations.schema";
export interface Invitation{
    uuid:string,
    title:string
    body:string,
    createdAtUTC:Date,
    expiredAtUTC:Date,
    invitationStatus:InvitationStatus
}


export interface ReceivedInvitationResponse extends Invitation{
    senderUuid:string,
    senderName:string,
    senderEmail:string,
    organizationUuid:string,
    organizationName:string,
}

export interface SentInvitationResponse extends Invitation,ReceivedInvitationResponse{
    recipientUuid:string,
    recipientName:string,
    recipientEmail:string,
}


export type CreateInvitation= z.infer<typeof createInvitationSchema> & {senderUuid:string};
export type UpdateInvitation= z.infer<typeof updateInvitationSchema>