import {type Request, type Response, type NextFunction} from "express";
import {rolesPermissions} from "../../permissions/roles-permissions"
import type {} from "../../utils/Request";
import {findByUuid} from "../../repositories/user.repository";
import {ForbiddenError} from "../../errors/forbidden.error";
import {findUserOrganizationByUuid} from "../../repositories/organizaiton.repository";
import {getUserOrganization} from "../../services/backend/organization.service";
import {isUserWorkingByUuid} from "../../services/backend/user.service";
import {ConflictError} from "../../errors/conflict.error";
import {Role} from "../../models/enums/roles";
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