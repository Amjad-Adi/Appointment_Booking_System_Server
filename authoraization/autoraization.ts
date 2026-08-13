import {type Request, type Response, type NextFunction} from "express";
import {rolesPermissions} from "../permissions/roles-permissions"
import type {} from "../utils/UserRequest";
import {findByUuid} from "../repositories/user.repository";
import {ForbiddenError} from "../errors/forbidden.error";
import {findUserOrganization} from "../repositories/organizaiton.repository";
import {getUserOrganization} from "../services/backend/organization.service";
import {isUserWorking} from "../services/backend/user.service";
import {ConflictError} from "../errors/conflict.error";
import {Role} from "../models/enums/roles";
export function authorize(permission:string) {
    return function (req: Request, res: Response, next: NextFunction) {
        const role: string = req.user?.role;
        if(!role){
            throw new ForbiddenError()
        }
        if (rolesPermissions[role]?.includes(permission)) {
            next();
        } else{
            throw new ForbiddenError();
        }
    }
}

export async function authorizeOrganizationUser(req: Request, res: Response, next: NextFunction){
        const userUuid: string = req.user.uuid;
        if(req.user.role!==Role.SUPER_ADMIN&&(await getUserOrganization(userUuid)).uuid!=req.params.organizationUuid){
            throw new ForbiddenError()
        }
        next();
}

export async function rejectWorkingUsers(req: Request, res: Response, next: NextFunction){
    const userUuid: string = req.user.uuid;
    if((await isUserWorking(userUuid))){
        throw new ConflictError()
    }
    next();
}