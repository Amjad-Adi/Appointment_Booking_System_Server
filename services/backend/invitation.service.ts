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
<<<<<<< Updated upstream
import {isUserAuthorizedToOrganization} from "./user.service";
import {getUserOrganization} from "./organization.service";
=======
import {AuthorizeOrganizationUser, isUserWorkingByEmail, isUserWorkingByUuid} from "./user.service";
import {getUserOrganization} from "./organization.service";
import {ForbiddenError} from "../../errors/forbidden.error";
import {InvitationStatus} from "../../models/enums/invitation-status";
>>>>>>> Stashed changes
export async function getInvitations(organizationUuid:string,userUuid:string):Promise<InvitationResponse[]>{
    await AuthorizeOrganizationUser(userUuid,organizationUuid);
    return (await findAll(organizationUuid))
}

export async function getInvitation(invitationUuid:string,organizationUuid:string,userUuid:string):Promise<InvitationResponse>{
    await AuthorizeOrganizationUser(userUuid,organizationUuid)
    let result:InvitationResponse= await findByUuid(organizationUuid,invitationUuid)
    if(result===undefined){
        throw new NotFoundError("Invitation");
    }
    return result
}

export async function createInvitation(invitation:CreateInvitation,organizationUuid:string,userUuid:string):Promise<Invitation>{
<<<<<<< Updated upstream
    await isUserAuthorizedToOrganization(userUuid,organizationUuid)
=======
    const [isAuthorized,isWorking]=await Promise.all([AuthorizeOrganizationUser(userUuid,organizationUuid),isUserWorkingByEmail(invitation.email)])
    if(!isAuthorized)
        throw new ForbiddenError()
    if(isWorking)
        throw new ConflictError()
>>>>>>> Stashed changes
    let result:Invitation= await create(invitation)
    if(result===undefined){
        throw new BadRequestErorr()
    }
    return result;
}

export async function updateInvitation(invitationUuid:string,organizationUuid:string,userUuid:string,invitationStatus:InvitationStatus):Promise<Invitation>{
    await AuthorizeOrganizationUser(userUuid,organizationUuid)
    let result:Invitation= await update(invitationStatus,invitationUuid)
    if(result===undefined){
        throw new NotFoundError("Invitation")
    }
    return result;
}