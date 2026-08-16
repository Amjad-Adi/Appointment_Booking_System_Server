import {
    findAll,
    findById,
    create,
    update,
    isNameFound
} from "../../repositories/service.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
import {CreateService, Service, PublicServiceResponse, UpdateService} from "../../models/service.model";
import {findIdByUuid} from "../../repositories/organizaiton.repository";
export async function getServices(organizationUuid:string):Promise<PublicServiceResponse[]>{
    return (await findAll(organizationUuid))
}

export async function getService(organizationUuid:string,serviceUuid:string):Promise<PublicServiceResponse>{
    let result:PublicServiceResponse= await findById(organizationUuid,serviceUuid)
    if(result===undefined){
        throw new NotFoundError("Service");
    }
    return result
}


export async function createService(service:CreateService):Promise<Service>{
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
    let result:Service= await update(service)
    if(result===undefined){
        throw new NotFoundError("service")
    }
    return result;
}