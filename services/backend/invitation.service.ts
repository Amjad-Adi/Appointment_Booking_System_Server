import {
    findAll,
    findByUuid,
    create,
    update,
} from "../../repositories/sent-invitation.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
import {CreateService, Service, ServiceResponse, UpdateService} from "../../models/service.model";
import {findIdByUuid} from "../../repositories/organizaiton.repository";
import {CreateInvitation, Invitation, InvitationResponse, UpdateInvitation} from "../../models/invitation.model";
import {isUserAuthorizedToOrganization} from "./user.service";
import {getUserOrganization} from "./organization.service";
export async function getInvitations(organizationUuid:string,userUuid:string):Promise<InvitationResponse[]>{
    await isUserAuthorizedToOrganization(userUuid,organizationUuid);
    return (await findAll(organizationUuid))
}

export async function getInvitation(invitationUuid:string,organizationUuid:string,userUuid:string):Promise<InvitationResponse>{
    await isUserAuthorizedToOrganization(userUuid,organizationUuid)
    let result:InvitationResponse= await findByUuid(organizationUuid,invitationUuid)
    if(result===undefined){
        throw new NotFoundError("Invitation");
    }
    return result
}

export async function createInvitation(invitation:CreateInvitation,organizationUuid:string,userUuid:string):Promise<Invitation>{
    await isUserAuthorizedToOrganization(userUuid,organizationUuid)
    let result:Invitation= await create(invitation)
    if(result===undefined){
        throw new BadRequestErorr()
    }
    return result;
}

export async function updateInvitation(invitation:UpdateInvitation,organizationUuid:string,userUuid:string):Promise<Invitation>{
    await isUserAuthorizedToOrganization(userUuid,organizationUuid)
    let result:Invitation= await update(invitation)
    if(result===undefined){
        throw new NotFoundError("Invitation")
    }
    return result;
}