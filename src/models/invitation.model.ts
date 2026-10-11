import { z } from "zod";

import { InvitationStatus } from "./enums/invitation-status";
import { Role } from "./enums/roles";

import {
    acceptInvitationSchema,
    createInvitationSchema,
    queryInvitationSchema, updateInvitationByOrganizationSchema,
} from "../middlewares/zod-schemas/invitations.schema";

export interface Invitation {
    uuid: string;
    recipientEmail: string;
    role: Role;
    createdAtUTC: Date;
    expiresAtUTC: Date;
    updatedAtUTC: Date;
    invitationStatus: InvitationStatus;
}

export interface InvitationResponse extends Invitation {
    senderUuid: string;
    senderFirstName: string;
    senderLastName: string;
    senderEmail: string;
    senderProfilePicturePath: string | null;
    organizationUuid: string;
    organizationName: string;
    organizationProfilePicturePath: string | null;
}
export type CreateInvitation = z.infer<typeof createInvitationSchema> & { organizationUuid: string; senderUuid: string; tokenHash:string };
export type UpdateInvitationByOrganization = z.infer<typeof updateInvitationByOrganizationSchema> & { uuid: string; organizationUuid: string; userUuid: string};
export type AcceptInvitation = z.infer<typeof acceptInvitationSchema> & {tokenHash:string,uid:string,profilePicturePath?:string,profilePictureId?:string};
export type QueryInvitation = z.infer<typeof queryInvitationSchema> & { offset: number; userUuid: string };