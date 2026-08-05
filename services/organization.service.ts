import {findAll, findById, create, update, updateByAdmin, isEmailFound, isPhoneNumberFound } from "../repositories/organizaiton.repository"
import {NotFoundError} from "../errors/not-found-error";
import {BadRequest} from "../errors/bad-request";
import {Conflict} from "../errors/conflict";
import {CreateOrganization, Organization, OrganizationResponse, UpdateOrganization, UpdateOrganizationByAdmin,} from "../models/organization";
import {CreateLocation} from "../models/location";
import {ActivationStatus} from "../models/enums/model-activation-status";
export async function getOrganizations():Promise<OrganizationResponse[]>{
    let result= await findAll()
    return result.rows.map((row):OrganizationResponse=>({
            uuid: row.uuid,
            name: row.name,
            email: row.email,
            phoneNumber: row.phoneNumber,
            bio: row.bio,
            profilePicturePath: row.profilePicturePath,
            location: {
                uuid: row.locationUUID,
                name: row.locationName,
                locationOnMap:[row.longitude, row.latitude] as [number,number],
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
    let result= await findById(uuid)
    if(result.rowCount==0){
        throw new NotFoundError("Organization");
    }
    return result.rows.map((row):OrganizationResponse=>({
            uuid: row.uuid,
            name: row.name,
            email: row.email,
            phoneNumber: row.phoneNumber,
            bio: row.bio,
            profilePicturePath: row.profilePicturePath,
            location: {
                uuid: row.locationUUID,
                name: row.locationName,
                locationOnMap:[row.longitude, row.latitude] as [number,number],
                createdAtUTC: row.locationCreatedAtUTC,
                updatedAtUTC: row.locationUpdatedAtUTC,
            },
            createdAtUTC: row.createdAtUTC,
            updatedAtUTC: row.updatedAtUTC,
            status: row.status
        }
    ))[0]
}

export async function createOrganization(organization:CreateOrganization):Promise<Organization>{
    if(await isEmailFound(organization.email)) {
        throw new Conflict()
    }
    if(await isPhoneNumberFound(organization.phoneNumber)) {
        throw new Conflict()
    }
    let result= await create(organization)
    if(result.rowCount==0){
        throw new BadRequest()
    }
    return result.rows[0];
}

export async function updateOrganization(organization:UpdateOrganization,uuid:string):Promise<Organization>{
    let result= await update(organization,uuid)
    if(result.rowCount==0){
        throw new NotFoundError("organization")
    }
    return result.rows[0];
}

export async function updateOrganizationByAdmin(organization:UpdateOrganizationByAdmin,uuid:string):Promise<Organization>{
    let result= await updateByAdmin(organization,uuid)
    if(result.rowCount==0){
        throw new NotFoundError("organization")
    }
    return result.rows[0];
}