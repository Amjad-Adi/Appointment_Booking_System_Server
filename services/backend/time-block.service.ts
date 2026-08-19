import {
    findAll,
    findByUuid,
    create,
    update,
} from "../../repositories/time-block.repository"
import {NotFoundError} from "../../errors/not-found.error";
import {BadRequestErorr} from "../../errors/bad-request.erorr";
import {CreateSpecialDay, SpecialDay, UpdateSpecialDay} from "../../models/special-days.model";
import {findIdByUuid, findUserOrganizationByUuid} from "../../repositories/organizaiton.repository";
import {AuthorizeOrganizationUser, getUserById, getUserIdByUuid} from "./user.service";
import {CreateTimeBlock, TimeBlock, UpdateTimeBlock} from "../../models/time-block";

export async function getTimeBlocks(organizationUuid:string,userUuid:string):Promise<TimeBlock[]>{
    await AuthorizeOrganizationUser(userUuid,organizationUuid);
    return (await findAll(organizationUuid))
}

export async function getTimeBlock(timeBlockUuid:string,organizationUuid:string,userUuid:string):Promise<TimeBlock>{
    await AuthorizeOrganizationUser(userUuid,organizationUuid);
    let result:TimeBlock= await findByUuid(organizationUuid,timeBlockUuid)
    if(result===undefined){
        throw new NotFoundError("Time Block");
    }
    return result
}

export async function createTimeBlock(timeBlock:CreateTimeBlock):Promise<TimeBlock>{
    await AuthorizeOrganizationUser(timeBlock.requestUserUuid,timeBlock.organizationUuid)
    timeBlock.requestUserId= await getUserIdByUuid(timeBlock.requestUserUuid)
    let result:TimeBlock= await create(timeBlock)
    if(result===undefined){
        throw new BadRequestErorr()
    }
    return result;
}

export async function updateTimeBlock(timeBlock:UpdateTimeBlock):Promise<TimeBlock>{
    await AuthorizeOrganizationUser(timeBlock.respondUserUuid,timeBlock.organizationUuid)
    timeBlock.respondUserId= await getUserIdByUuid(timeBlock.respondUserUuid)
    let result:TimeBlock= await update(timeBlock)
    if(result===undefined){
        throw new NotFoundError("Time Block")
    }
    return result;
}