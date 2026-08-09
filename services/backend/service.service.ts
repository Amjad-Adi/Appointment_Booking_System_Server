import {
    findAll,
    findById,
    create,
    update,
    isNameFound, findIdByUuid
} from "../../repositories/service.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {ConflictError} from "../../errors/conflict.error";
import {CreateService, Service, ServiceResponse, UpdateService} from "../../models/service.model";
export async function getServices():Promise<ServiceResponse[]>{
    return (await findAll()).rows
}

export async function getService(uuid:string):Promise<ServiceResponse>{
    let result= await findById(uuid)
    if(result.rowCount==0){
        throw new NotFoundError("Service");
    }
    return result.rows[0]
}


export async function createService(service:CreateService):Promise<Service>{
    let organizationId= await findIdByUuid(service.organizationUuid)
    if(organizationId==null){
        throw new NotFoundError("Organization");
    }
    service.organizationId=organizationId
    if(await isNameFound(service.organizationUuid,service.name)===true) {
        throw new ConflictError()
    }
    let result= await create(service)
    if(result.rowCount==0){
        throw new BadRequestErorr()
    }
    return result.rows[0];
}

export async function updateService(service:UpdateService):Promise<Service>{
    let result= await update(service)
    if(result.rowCount==0){
        throw new NotFoundError("service")
    }
    return result.rows[0];
}