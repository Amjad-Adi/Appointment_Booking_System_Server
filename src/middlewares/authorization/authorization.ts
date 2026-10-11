import {type Request, type Response, type NextFunction} from "express";
import {rolesPermissions} from "../../permissions/roles-permissions"
import {ForbiddenError} from "../../errors/forbidden.error";
import {getUserOrganization} from "../../services/organization.service";
import {Role} from "../../models/enums/roles";
export function authorize(permission:string) {
    return function (req: Request, res: Response, next: NextFunction) {
        const role: Role | undefined = req.user?.role;
        if(!role){
            throw new ForbiddenError()
        }
        if (rolesPermissions[role].has(permission)) {
            next();
        } else{
            throw new ForbiddenError();
        }
    }
}

export async function verifyOrganizationOwnership(userUuid: string, organizationUuid: string,): Promise<void> {
    const organization = await getUserOrganization(userUuid);
    if (!organization || organization.uuid !== organizationUuid) {
        throw new ForbiddenError();
    }
}