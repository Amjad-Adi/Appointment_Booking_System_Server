import {
    AcceptInvitation, CreateInvitation, InvitationResponse, QueryInvitation,
    UpdateInvitationByOrganization } from '../models/invitation.model';
import { generateSecureToken } from '../utils/hash';
import { verifyOrganizationOwnership } from '../middlewares/authorization/authorization';
import { acceptInvitationByToken, countAll, create, findAll, findByUuid, update } from '../repositories/invitation.repository';
import { NotFoundError } from '../errors/not-found.error';
import { ConflictError } from '../errors/conflict.error';
import { getUserByEmail } from './user.service';

export async function getInvitations(query: QueryInvitation) {
    return findAll(query);
}

export async function getNumberOfInvitations(query: QueryInvitation): Promise<number> {
    return countAll(query);
}

export async function getInvitation(invitationUuid: string,organizationUuid: string,userUuid: string): Promise<InvitationResponse> {
    await verifyOrganizationOwnership(userUuid,organizationUuid);
    const result = await findByUuid(organizationUuid,invitationUuid);
    if (result === undefined) {
        throw new NotFoundError("Invitation");
    }
    return result;
}

export async function createInvitation(invitation: CreateInvitation) {
    const { rawToken,tokenHash } = generateSecureToken();
    invitation.tokenHash = tokenHash;
    const user=await getUserByEmail(invitation.recipientEmail);
    if(user===undefined){
        throw new ConflictError("User is already registered");
    }
    const invitationResult = await create(invitation);
    return { invitationResult, rawToken};
}

export async function updateInvitationByOrganization(invitation: UpdateInvitationByOrganization) {
    await verifyOrganizationOwnership(invitation.userUuid,invitation.organizationUuid);
    const result = await update(invitation);
    if (!result) {
        throw new NotFoundError("Invitation");
    }
    return result;
}

export async function acceptInvitationByUser(acceptInvitation: AcceptInvitation) {
    const result = await acceptInvitationByToken(acceptInvitation);
    if (!result) {
        throw new NotFoundError("Invitation");
    }
    return result;
}