import {type Request, type Response, type NextFunction} from "express";
import {rolesPermissions} from "../permissions/roles-permissions"
import type {} from "../utils/UserRequest";
import {findByUuid} from "../repositories/user.repository";
import {ForbiddenError} from "../errors/forbidden.error";
export function authorize(permission:string) {
    return function (req: Request, res: Response, next: NextFunction) {
        const role: string = req.user?.role;
        if(!role){
            throw new ForbiddenError()
        }
        if (rolesPermissions.get(role)?.includes(permission)) {
            next();
        } else{
            throw new ForbiddenError();
        }
    }
}

export function authorizeOrganizationManager(organizationUuid:string){
    return function (req: Request, res: Response, next: NextFunction) {
        const userUuid: string = req.user.uuid;
        if (rolesPermissions.get(role)?.includes(permission)) {
            next();
        } else{
            throw new ForbiddenError();
        }
    }
}