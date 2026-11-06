import { z } from 'zod';

import { CustomerInvitationStatus } from '../../models/enums/customer-invitation-status';

import { querySchema } from './query.schema';

import {
    SORT_BY_CREATED_AT_UTC,
    SORT_BY_EXPIRES_AT_UTC,
    SORT_BY_UPDATED_AT_UTC,
} from '../../databases/contracts/customer-invitation.contract';

export const createCustomerInvitationSchema = z.object({
    recipientEmail: z.email({ error: 'Invalid email address' }),
    expiresAtUTC: z.iso.datetime({ error: 'Invalid invitation expiration date' }).optional(),
}).strict().refine(
    (data) => !data.expiresAtUTC || new Date(data.expiresAtUTC).getTime() > Date.now(),
    { message: 'Invitation expiration must be in the future', path: ['expiresAtUTC'] },
);

export const updateCustomerInvitationSchema = z.object({
    status: z.enum([CustomerInvitationStatus.CANCELLED], { error: 'Invalid invitation status' }),
}).strict();

export const respondCustomerInvitationSchema = z.object({
    status: z.enum(
        [CustomerInvitationStatus.ACCEPTED, CustomerInvitationStatus.REJECTED],
        { error: 'Invalid invitation response' },
    ),
}).strict();

export const customerInvitationFilterSchema = z.object({
    status: z.enum(CustomerInvitationStatus, { error: 'Invalid invitation status' }).optional(),
}).strict();

export const queryCustomerInvitationSchema = querySchema.extend({
    search: z.string().trim().max(320, { error: 'Search must be at most 320 characters' }).optional(),
    filter: customerInvitationFilterSchema.optional(),
    sortBy: z.enum(
        [SORT_BY_CREATED_AT_UTC, SORT_BY_UPDATED_AT_UTC, SORT_BY_EXPIRES_AT_UTC],
        { error: 'Invalid sort field' },
    ).optional(),
}).strict();
