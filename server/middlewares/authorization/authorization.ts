import {type Request, type Response, type NextFunction} from "express";
import {rolesPermissions} from "../../permissions/roles-permissions.js"
import type {} from "../../utils/Request.js";
import {findByUuid} from "../../repositories/user.repository.js";
import {ForbiddenError} from "../../errors/forbidden.error.js";
import {findUserOrganizationByUuid} from "../../repositories/organizaiton.repository.js";
import {getUserOrganization} from "../../services/organization.service.js";
import {isUserWorkingByUuid} from "../../services/user.service.js";
import {ConflictError} from "../../errors/conflict.error.js";
import {Role} from "../../models/enums/roles.js";
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