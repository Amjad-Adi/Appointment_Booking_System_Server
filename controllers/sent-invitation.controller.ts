import {
    getInvitation,
    getInvitations,
    createInvitation,
    updateInvitation,
} from "../services/backend/invitation.service"
import { type Request, type Response } from "express";
import {CreateService, Service, ServiceResponse, UpdateService} from "../models/service.model";
import {getOrganizationIdByUuid, getUserOrganization} from "../services/backend/organization.service";
import {findIdByUuid} from "../repositories/organizaiton.repository";
import {} from "../utils/UserRequest"
import {CreateInvitation, Invitation, InvitationResponse, UpdateInvitation} from "../models/invitation.model";
import {InviteUser} from "../models/user.model";
import {inviteFireBaseUser} from "../services/backend/firebase-admin.service";
import {getUserById, getUserIdByUuid} from "../services/backend/user.service";
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
    const result:InvitationResponse=await getInvitation(organizationUuid,invitationUuid,userUuid)
    return res.status(200).json(result)
}

export async function handleCreateOrganizationInvitation(req:Request,res:Response){
    const userToInvite:CreateInvitation=(req.body)
    const currentUserUuid:string =req.user.uuid
    const organizationUuid=req.params.orgainzationUuid as string;
    userToInvite.senderId= await getUserIdByUuid(currentUserUuid)
    userToInvite.organizationId=await getOrganizationIdByUuid(organizationUuid)
    const invitation:Invitation=await createInvitation(userToInvite,organizationUuid,currentUserUuid)
    let result=await inviteFireBaseUser(userToInvite.email,invitation.uuid)
    return res.status(201).json(result)
}

export async function handleUpdateOrganizationInvitation(req:Request,res:Response){
    const invitation:UpdateInvitation=(req.body)
    invitation.uuid=req.params.invitaitonUuid as string
    let userUuid:string=req.user.uuid as string;
    let organizationUuid:string=req.params.organizationUuid  as string;
    const result:Invitation=await updateInvitation(invitation,organizationUuid,userUuid)
    return res.status(200).json(result)
}
