import {
    findAll,
    findByUuid,
    create,
    update, isTodayFound,
} from "../repositories/special-days.repository.js"
import {NotFoundError} from "../errors/not-found.error.js";
import {BadRequestError} from "../errors/bad-request.error.js";
import {CreateSpecialDay, SpecialDay, UpdateSpecialDay} from "../models/special-days.model.js";
import {findIdByUuid} from "../repositories/organizaiton.repository.js";
import {AuthorizeOrganizationUser} from "./user.service.js";

export async function getSpecialDays(organizationUuid:string,userUuid:string):Promise<SpecialDay[]>{
    return (await findAll(organizationUuid))
}

export async function getSpecialDay(specialDayUuid:string,organizationUuid:string,userUuid:string):Promise<SpecialDay>{
    const result:SpecialDay= await findByUuid(organizationUuid,specialDayUuid)
    if(result===undefined){
        throw new NotFoundError("Special Day");
    }
    return result
}

export async function createSpecialDay(specialDay:CreateSpecialDay):Promise<SpecialDay>{
    await AuthorizeOrganizationUser(specialDay.userUuid,specialDay.organizationUuid)
    const organizationId:number= await findIdByUuid(specialDay.organizationUuid)
    if(organizationId===undefined){
        throw new NotFoundError("Organization");
    }
    specialDay.organizationId=organizationId
    const result:SpecialDay= await create(specialDay)
    if(result===undefined){
        throw new BadRequestError()
    }
    return result;
}

export async function updateSpecialDay(specialDay:UpdateSpecialDay):Promise<SpecialDay>{
    await AuthorizeOrganizationUser(specialDay.userUuid,specialDay.organizationUuid)
    const result:SpecialDay= await update(specialDay)
    if(result===undefined){
        throw new NotFoundError("Special Day")
    }
    return result;
}

export async function isTodaySpecialDay(organizationUuid:string){
    const result:SpecialDay= await isTodayFound(organizationUuid,new Date().toISOString().split("T")[0])
    if(result===undefined){
        throw new NotFoundError("Special Day")
    }
    return result;
}