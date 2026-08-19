import {
    getInvitation,
    getInvitations,
    createInvitation,
    updateInvitation,
} from "../services/backend/invitation.service"
import { type Request, type Response } from "express";
import {CreateService, Service, ServiceResponse, UpdateService} from "../models/service.model";
import {getOrganization, getOrganizationIdByUuid, getUserOrganization} from "../services/backend/organization.service";
import {findIdByUuid} from "../repositories/organizaiton.repository";
import {} from "../utils/UserRequest"
import {CreateInvitation, Invitation, InvitationResponse, UpdateInvitation} from "../models/invitation.model";
import {InviteUser, UserResponse} from "../models/user.model";
import {inviteFireBaseUser} from "../services/backend/firebase-admin.service";
import {getUserByFireBaseUid, getUserById, getUserIdByUuid} from "../services/backend/user.service";
import {OrganizationResponse} from "../models/organization.model";
import {InvitationStatus} from "../models/enums/invitation-status";
import {getAuth} from "firebase/auth";
import {UnauthorizedError} from "../errors/unauthorized.error";
import {generateToken} from "./authentication/jwt.authentication.controller";
import firebase from "firebase/compat/app";
import UserCredential = firebase.auth.UserCredential;
import {invitationLogin} from "./authentication/authentication-management.controller";
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