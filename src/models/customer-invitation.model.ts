import { z } from 'zod';

import { CustomerInvitationStatus } from './enums/customer-invitation-status';

import {
    createCustomerInvitationSchema,
    queryCustomerInvitationSchema,
    respondCustomerInvitationSchema,
    updateCustomerInvitationSchema,
} from '../middlewares/zod-schemas/customer-invitation.schema';

import { DataResponses } from './query.model';

export interface CustomerInvitation {
    uuid: string;
    recipientEmail: string;
    status: CustomerInvitationStatus;
    createdAtUTC: Date;
    updatedAtUTC: Date;
    expiresAtUTC: Date;
    respondedAtUTC: Date | null;
}

export interface CustomerInvitationResponse extends CustomerInvitation, DataResponses {
    organizationUuid: string;
    organizationName: string;
    organizationProfilePicturePath: string | null;
    senderUuid: string;
    senderFirstName: string;
    senderLastName: string;
    senderEmail: string;
}

export type CreateCustomerInvitation = z.infer<typeof createCustomerInvitationSchema> & {
    organizationUuid: string;
    senderUuid: string;
};

export type UpdateCustomerInvitation = z.infer<typeof updateCustomerInvitationSchema> & {
    uuid: string;
    organizationUuid: string;
    userUuid: string;
};

export type RespondCustomerInvitation = z.infer<typeof respondCustomerInvitationSchema> & {
    uuid: string;
    userUuid: string;
};

export type QueryCustomerInvitation = z.infer<typeof queryCustomerInvitationSchema> & {
    offset: number;
    userUuid?: string;
    organizationUuid?: string;
};
