import { z } from "zod";

import { InvitationStatus } from "./enums/invitation-status.js";
import { Role } from "./enums/roles.js";

import {
    createInvitationSchema,
    queryInvitationSchema,
    updateInvitationSchema,
} from "../middlewares/zod-schemas/invitations.schema.js";

export interface Invitation {
    uuid: string;
    recipientEmail: string;
    role: Role;
    createdAtUTC: Date;
    expiresAtUTC: Date;
    acceptedAtUTC?: Date;
    invitationStatus: InvitationStatus;
}

export interface InvitationResponse
    extends Invitation {
    senderUuid: string;
    senderFirstName: string;
    senderLastName: string;
    senderEmail: string;
    senderProfilePicturePath: string | null;

    organizationUuid: string;
    organizationName: string;
    organizationProfilePicturePath: string | null;
}

export type CreateInvitation =
    z.infer<
        typeof createInvitationSchema
    > & {
    organizationId: number;
    senderId: number;
    tokenHash:string
};

export type UpdateInvitation =
    z.infer<
        typeof updateInvitationSchema
    > & {
    uuid: string;
    organizationUuid: string;
    userUuid: string;
};

export type QueryInvitation =
    z.infer<
        typeof queryInvitationSchema
    > & {
    offset: number;
};