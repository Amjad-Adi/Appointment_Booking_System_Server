import {
    findAll,
    findUserOrganizationByUuid,
    create,
    update,
    updateByAdmin,
    isEmailFound,
    isPhoneNumberFound, findByUuid, findIdByUuid
} from "../../repositories/organizaiton.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
import {
    CreateOrganization, Organization, OrganizationResponse,
    OrganizationRow, UpdateOrganization, UpdateOrganizationByAdmin,
} from "../../models/organization.model";
import {isUserWorkingByUuid} from "./user.service";
import {ForbiddenError} from "../../errors/forbidden.error";
export async function getOrganizations():Promise<OrganizationResponse[]>{
    const result:OrganizationRow[]= await findAll()
    return result.map((row):OrganizationResponse=>({
            uuid: row.uuid,
            name: row.name,
            email: row.email,
            phoneNumber: row.phoneNumber,
            bio: row.bio,
            profilePicturePath: row.profilePicturePath,
            location: {
                name: row.locationName,
                locationOnMap:[row.longitude, row.latitude] as [number|null,number|null],
                createdAtUTC: row.locationCreatedAtUTC,
                updatedAtUTC: row.locationUpdatedAtUTC,
            },
            createdAtUTC: row.createdAtUTC,
            updatedAtUTC: row.updatedAtUTC,
            status: row.status
        }
    ))
}

export async function getOrganization(uuid:string):Promise<OrganizationResponse>{
    const result:OrganizationRow= await findByUuid(uuid)
    if(result===undefined){
        throw new NotFoundError("Organization");
    }
    return {
        uuid: result.uuid,
        name: result.name,
        email: result.email,
        phoneNumber: result.phoneNumber,
        bio: result.bio,
        profilePicturePath: result.profilePicturePath,
        location: {
            name: result.locationName,
            locationOnMap: [result.longitude, result.latitude] as [number | null, number | null],
            createdAtUTC: result.locationCreatedAtUTC,
            updatedAtUTC: result.locationUpdatedAtUTC,
        },
        createdAtUTC: result.createdAtUTC,
        updatedAtUTC: result.updatedAtUTC,
        status: result.status
    }
}

export async function createOrganization(organization:CreateOrganization):Promise<Organization>{
    const [emailFound,phoneNumberFound,userWorking]=await Promise.all(
        [await isEmailFound(organization.email),await isPhoneNumberFound(organization.phoneNumber),(await isUserWorkingByUuid(organization.organizationOwnerUuid))])
    if(emailFound||phoneNumberFound||userWorking){
        throw new ConflictError()
    }
    const result= await create(organization)
    if(result===undefined){
        throw new BadRequestErorr()
    }
    return result;
}

export async function updateOrganization(organization:UpdateOrganization):Promise<Organization>{
    if((await getUserOrganization(organization.userUuid)).uuid!=organization.uuid){
        throw new ForbiddenError()
    }
    const result:Organization= await update(organization)
    if(result===undefined){
        throw new NotFoundError("organization")
    }
    return result;
}

export async function updateOrganizationByAdmin(organization:UpdateOrganizationByAdmin):Promise<Organization>{
    const result:Organization= await updateByAdmin(organization)
    if(result===undefined){
        throw new NotFoundError("organization")
    }
    return result;
}

export async function getUserOrganization(userUuid:string):Promise<OrganizationResponse>{
    const result:OrganizationRow=await findUserOrganizationByUuid(userUuid)
    if(result===undefined){
        throw new NotFoundError("Organization");
    }
    return {
        uuid: result.uuid,
        name: result.name,
        email: result.email,
        phoneNumber: result.phoneNumber,
        bio: result.bio,
        profilePicturePath: result.profilePicturePath,
        location: {
            name: result.locationName,
            locationOnMap: [result.longitude, result.latitude] as [number | null, number | null],
            createdAtUTC: result.locationCreatedAtUTC,
            updatedAtUTC: result.locationUpdatedAtUTC,
        },
        createdAtUTC: result.createdAtUTC,
        updatedAtUTC: result.updatedAtUTC,
        status: result.status
    }
}

export async function getOrganizationIdByUuid(uuid:string):Promise<number>{
    const result:number= await findIdByUuid(uuid);
    if(result===undefined){
        throw new NotFoundError("Organization");
    }
    return result;
}