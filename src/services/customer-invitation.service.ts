import {
    CreateCustomerInvitation,
    QueryCustomerInvitation,
    RespondCustomerInvitation,
    UpdateCustomerInvitation,
} from '../models/customer-invitation.model';

import { Role } from '../models/enums/roles';

import {
    countAll,
    create,
    findCustomerByEmail,
    findAll,
    findPending,
    isMember,
    respondByCustomer,
    updateByOrganization,
} from '../repositories/customer-invitation.repository';

import { BadRequestError } from '../errors/bad-request.error';
import { ConflictError } from '../errors/conflict.error';
import { NotFoundError } from '../errors/not-found.error';

const DEFAULT_INVITATION_VALIDITY_IN_DAYS = 7;

export async function getCustomerInvitations(query: QueryCustomerInvitation) {
    return findAll(query);
}

export async function getNumberOfCustomerInvitations(query: QueryCustomerInvitation) {
    return countAll(query);
}

export async function createCustomerInvitation(invitation: CreateCustomerInvitation) {
    const customer = await findCustomerByEmail(invitation.recipientEmail);

    if (customer === undefined) {
        throw new NotFoundError('Customer');
    }

    if (customer.role !== Role.CUSTOMER) {
        throw new BadRequestError('Only customers can be invited through customer invitations');
    }

    if (await isMember(invitation.organizationUuid, customer.uuid)) {
        throw new ConflictError('Customer is already linked to this organization');
    }

    if (await findPending(invitation.organizationUuid, customer.id)) {
        throw new ConflictError('A pending invitation already exists for this customer');
    }

    const { expiresAtUTC: requestedExpiresAtUTC, ...invitationData } = invitation;
    const expiresAtUTC =
        requestedExpiresAtUTC !== undefined
            ? new Date(requestedExpiresAtUTC)
            : new Date(Date.now() + DEFAULT_INVITATION_VALIDITY_IN_DAYS * 24 * 60 * 60 * 1000);

    const result = await create({
        ...invitationData,
        recipientUserId: customer.id,
        expiresAtUTC,
    });

    if (result === undefined) {
        throw new NotFoundError('Organization');
    }

    return result;
}

export async function cancelCustomerInvitation(invitation: UpdateCustomerInvitation) {
    const result = await updateByOrganization(invitation);

    if (result === undefined) {
        throw new NotFoundError('Customer invitation');
    }

    return result;
}

export async function respondToCustomerInvitation(invitation: RespondCustomerInvitation) {
    const result = await respondByCustomer(invitation);

    if (!result) {
        throw new NotFoundError('Customer invitation');
    }
}
