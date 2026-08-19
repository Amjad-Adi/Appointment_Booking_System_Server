import {
    findAll,
    findByUuid,
    create,
    update,
} from "../../repositories/invitation.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {CreateInvitation, Invitation, InvitationResponse, UpdateInvitation} from "../../models/invitation.model";
import {AuthorizeOrganizationUser} from "./user.service";
import {InvitationStatus} from "../../models/enums/invitation-status";
import {RoomResponse} from "../../models/room.model";
import {getRoom} from "./room.service";
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
    await AuthorizeOrganizationUser(userUuid,organizationUuid)
    let result:Invitation= await create(invitation)
    if(result===undefined){
        throw new BadRequestErorr()
    }
    return result;

export async function updateInvitation(invitation:UpdateInvitation):Promise<Invitation>{
    let result:Invitation= await update(invitation)
    if(result===undefined){
        throw new NotFoundError("Invitation")
    }
    return result;
}