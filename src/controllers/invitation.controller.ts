import {
    getInvitation,
    getInvitations,
    createInvitation,
    updateInvitation,
} from "../services/invitation.service.js"
import { type Request, type Response } from "express";
import {getOrganization, getOrganizationIdByUuid, getUserOrganization} from "../services/organization.service.js";
import {} from "../utils/Request.js"
import {CreateInvitation, Invitation, InvitationResponse, UpdateInvitation} from "../models/invitation.model.js";
import {inviteFireBaseUser} from "../services/firebase-admin.service.js";
import {getUserByFireBaseUid, getUserById, getUserIdByUuid} from "../services/user.service.js";
import {OrganizationResponse} from "../models/organization.model.js";
import {InvitationStatus} from "../models/enums/invitation-status.js";
export async function handleGetOrganizationInvitations(req:Request,res:Response){
    let organizationUuid:string=req.params.organizationUuid  as string;
    let userUuid:string=req.user.uuid as string;
    const result:InvitationResponse[]=await getInvitations(organizationUuid,userUuid)
    return res.status(200).json(result)
}

export async function handleGetOrganizationInvitation(req:Request,res:Response){
    let invitationUuid:string=req.params.invitationUuid as string;
    let userUuid:string=req.user.uuid as string;
    let organizationUuid:string=req.params.organizationUuid  as string;
    const result:InvitationResponse=await getInvitation(invitationUuid,organizationUuid,userUuid)
    return res.status(200).json(result)
}

export async function handleCreateOrganizationInvitation(req:Request,res:Response){
    const userToInvite:CreateInvitation=(req.body)
    const currentUserUuid:string =req.user.uuid
    const organizationUuid=req.params.organizationUuid as string;
    const organization:OrganizationResponse=await getOrganization(organizationUuid)
    userToInvite.senderId= await getUserIdByUuid(currentUserUuid)
    userToInvite.organizationId=await getOrganizationIdByUuid(organizationUuid)
    const invitation:Invitation=await createInvitation(userToInvite,organizationUuid,currentUserUuid)
    await inviteFireBaseUser(invitation.uuid,organization.name,req.user.email,userToInvite.email)
    return res.status(201).json(invitation)
}

export async function handleReceiveOrganizationInvitation(req:Request,res:Response){
    let invitation:UpdateInvitation=req.body
    invitation.uuid=req.params.invitationUuid as string;
    invitation.userUuid=req.user.uuid as string;
    invitation.organizationUuid=req.params.organizationUuid  as string;
    invitation.status=InvitationStatus.ACCEPTED
    let result:Invitation=await updateInvitation(invitation)
    return res.status(200).json(result)
}