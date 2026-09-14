import {
    findAll,
    findByUuid,
    create,
    update,
    isNameFound, countAll,findIdByUuid
} from "../repositories/service.repository.js"
import {NotFoundError} from "../errors/not-found.error.js";
import {BadRequestError} from "../errors/bad-request.error.js";
import {ConflictError} from "../errors/conflict.error.js";
import {CreateService, QueryService, Service, ServiceResponse, UpdateService} from "../models/service.model.js";
import {findIdByUuid as findOrganizationIdByUuid} from "../repositories/organizaiton.repository.js";
import {AuthorizeOrganizationUser} from "./user.service.js";
export async function getServices(query:QueryService):Promise<ServiceResponse[]>{
    return (await findAll(query))
}

export async function getNumberOfServices(query:QueryService):Promise<number>{
    return (await countAll(query))
}

export async function getService(serviceUuid:string):Promise<ServiceResponse>{
    const result:ServiceResponse | undefined= await findByUuid(serviceUuid)
    if(result===undefined){
        throw new NotFoundError("Service");
    }
    return result
}

export async function getServiceIdByUuid(serviceUuid:string,organizationUuid:string):Promise<number>{
    const result:number|undefined= await findIdByUuid(serviceUuid,organizationUuid)
    if(result===undefined){
        throw new NotFoundError("Service");
    }
    return result
}

export async function createService(service:CreateService,userUuid:string):Promise<Service>{
    await AuthorizeOrganizationUser(userUuid,service.organizationUuid)
    const organizationId:number|undefined= await findOrganizationIdByUuid(service.organizationUuid)
    if(organizationId===undefined){
        throw new NotFoundError("Organization");
    }
    service.organizationId=organizationId
    if(await isNameFound(service.organizationUuid,service.name)) {
        throw new ConflictError()
    }
    const result:Service= await create(service)
    if(result===undefined){
        throw new BadRequestError()
    }
    return result;
}

export async function updateService(service:UpdateService):Promise<Service>{
    await AuthorizeOrganizationUser(service.userUuid,service.organizationUuid)
    const result:Service= await update(service)
    if(result===undefined){
        throw new NotFoundError("Service")
    }
    return result;
}