import {
    findAll,
    findByUuid,
    create,
    update,countAll,findIdByUuid, findPictureIdByUuid
} from "../repositories/service.repository"
import {NotFoundError} from "../errors/not-found.error";
import {CreateService, QueryService, Service, ServiceResponse, UpdateService} from "../models/service.model";

export async function getServices(query:QueryService):Promise<ServiceResponse[]>{
    return (await findAll(query))
}

export async function getNumberOfServices(query:QueryService):Promise<number>{
    return (await countAll(query))
}

export async function getService(serviceUuid:string,organizationUuid:string|undefined):Promise<ServiceResponse>{
    const result:ServiceResponse | undefined= await findByUuid(serviceUuid,organizationUuid)
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

export async function getServicePictureIdByUuid(serviceUuid:string):Promise<string>{
    const result:string|undefined= await findPictureIdByUuid(serviceUuid)
    if(result===undefined){
        throw new NotFoundError("Service");
    }
    return result
}

export function createService(service:CreateService):Promise<Service>{
    return create(service)
}

export async function updateService(service:UpdateService):Promise<Service>{
    const result:Service= await update(service)
    if(result===undefined){
        throw new NotFoundError("Service")
    }
    return result;
}