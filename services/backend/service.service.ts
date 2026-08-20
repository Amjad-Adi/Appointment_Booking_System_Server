import {
    findAll,
    findByUuid,
    create,
    update,
    isNameFound, countAll
} from "../../repositories/service.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
import {CreateService, QueryService, Service, ServiceResponse, UpdateService} from "../../models/service.model";
import {findIdByUuid} from "../../repositories/organizaiton.repository";
import {AuthorizeOrganizationUser} from "./user.service";
export async function getServices(query:QueryService,organizationUuid:string):Promise<ServiceResponse[]>{
    return (await findAll(query,organizationUuid))
}

export async function getNumberOfServices(query:QueryService,organizationUuid:string):Promise<number>{
    return (await countAll(query,organizationUuid))
}

export async function getService(serviceUuid:string,organizationUuid:string):Promise<ServiceResponse>{
    let result:ServiceResponse= await findByUuid(organizationUuid,serviceUuid)
    if(result===undefined){
        throw new NotFoundError("Service");
    }
    return result
}


export async function createService(service:CreateService,userUuid:string):Promise<Service>{
    await AuthorizeOrganizationUser(userUuid,service.organizationUuid)
    let organizationId:number= await findIdByUuid(service.organizationUuid)
    if(organizationId===undefined){
        throw new NotFoundError("Organization");
    }
    service.organizationId=organizationId
    if(await isNameFound(service.organizationUuid,service.name)===true) {
        throw new ConflictError()
    }
    let result:Service= await create(service)
    if(result===undefined){
        throw new BadRequestErorr()
    }
    return result;
}

export async function updateService(service:UpdateService):Promise<Service>{
    await AuthorizeOrganizationUser(service.userUuid,service.organizationUuid)
    let result:Service= await update(service)
    if(result===undefined){
        throw new NotFoundError("Service")
    }
    return result;
}