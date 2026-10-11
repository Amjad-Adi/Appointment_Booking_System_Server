import { findAll, findUserOrganizationByUuid, create, update ,countAll, findByUuid, findIdByUuid } from "../repositories/organizaiton.repository"
import {NotFoundError} from "../errors/not-found.error";
import {ConflictError} from "../errors/conflict.error";
import { CreateOrganization, CreateOrganizationByAdmin, Organization, OrganizationResponse, OrganizationRow, QueryOrganization, UpdateOrganizationByUser, UpdateOrganizationByAdmin, } from "../models/organization.model";
import { getUserByEmail} from "./user.service";
import { verifyOrganizationOwnership } from '../middlewares/authorization/authorization';

export async function getOrganizations(query: QueryOrganization):Promise<OrganizationResponse[]>{
    const result:OrganizationRow[]= await findAll(query)
    return result.map((row):OrganizationResponse=>({
            uuid: row.uuid,
            name: row.name,
            email: row.email,
            phoneNumber: row.phoneNumber,
            bio: row.bio,
            profilePicturePath: row.profilePicturePath,
            location: {
                name: row.locationName,
                timezone:row.timezone,
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

export async function getNumberOfOrganizations(query: QueryOrganization): Promise<number> {
    return await countAll(query);
}


export async function getOrganization(uuid:string):Promise<OrganizationResponse>{
    const result:OrganizationRow | undefined= await findByUuid(uuid)
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
            timezone:result.timezone,
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
    return create(organization)
}

export async function updateOrganization(organization:UpdateOrganizationByUser):Promise<Organization>{
    await verifyOrganizationOwnership(organization.userUuid,organization.uuid)
    const result:Organization= await update(organization)
    if(result===undefined){
        throw new NotFoundError("organization")
    }
    return result;
}

export async function updateOrganizationByAdmin(organization:UpdateOrganizationByAdmin):Promise<Organization>{
    const result:Organization= await update(organization)
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
            timezone:result.timezone,
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

export async function createOrganizationByAdmin(organization: CreateOrganizationByAdmin): Promise<Organization> {
    const user= await getUserByEmail(organization.userEmail)
    if (user === undefined) {
        throw new NotFoundError("User");
    }
    if(user.organizationUuid !== null){
        throw new ConflictError("User Already Have an Organization")
    }
    const {
        userEmail,
        ...organizationData
    } = organization;
    const createData: CreateOrganization = {
        ...organizationData,
        organizationOwnerUuid: user.uuid,
    };
    return await createOrganization(createData);
}