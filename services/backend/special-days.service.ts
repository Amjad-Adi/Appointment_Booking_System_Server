import {
    findAll,
    findByUuid,
    create,
    update, isTodayFound,
} from "../../repositories/special-days.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {CreateSpecialDay, SpecialDay, UpdateSpecialDay} from "../../models/special-days.model";
import {findIdByUuid} from "../../repositories/organizaiton.repository";
import {AuthorizeOrganizationUser} from "./user.service";

export async function getSpecialDays(organizationUuid:string):Promise<SpecialDay[]>{
    return (await findAll(organizationUuid))
}

export async function getSpecialDay(specialDayUuid:string,organizationUuid:string):Promise<SpecialDay>{
    let result:SpecialDay= await findByUuid(organizationUuid,specialDayUuid)
    if(result===undefined){
        throw new NotFoundError("Special Day");
    }
    return result
}

export async function createSpecialDay(specialDay:CreateSpecialDay):Promise<SpecialDay>{
    await AuthorizeOrganizationUser(specialDay.userUuid,specialDay.organizationUuid)
    let organizationId:number= await findIdByUuid(specialDay.organizationUuid)
    if(organizationId===undefined){
        throw new NotFoundError("Organization");
    }
    specialDay.organizationId=organizationId
    let result:SpecialDay= await create(specialDay)
    if(result===undefined){
        throw new BadRequestErorr()
    }
    return result;
}

export async function updateSpecialDay(specialDay:UpdateSpecialDay):Promise<SpecialDay>{
    await AuthorizeOrganizationUser(specialDay.userUuid,specialDay.organizationUuid)
    let result:SpecialDay= await update(specialDay)
    if(result===undefined){
        throw new NotFoundError("Special Day")
    }
    return result;
}

export async function isTodaySpecialDay(organizationUuid:string){
    let result:SpecialDay= await isTodayFound(organizationUuid,new Date().toISOString().split("T")[0])
    if(result===undefined){
        throw new NotFoundError("Special Day")
    }
    return result;
}