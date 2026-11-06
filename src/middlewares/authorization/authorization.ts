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

export async function verifyOrganizationAccess(req: Request, organizationUuid: string): Promise<void> {
    const role = req.user?.role;
    if (!role) {
        throw new ForbiddenError();
    }
    if (role === Role.SUPER_ADMIN) {
        return;
    }
    await verifyOrganizationOwnership(req.user?.uuid as string, organizationUuid);
}

/**
 * Read-only organization data (working hours, special days) that customers
 * also need in order to book confidently. Writes must keep using
 * verifyOrganizationOwnership.
 */
export async function verifyOrganizationReadAccess(req: Request, organizationUuid: string): Promise<void> {
    const role = req.user?.role;
    if (!role) {
        throw new ForbiddenError();
    }
    if (role === Role.SUPER_ADMIN || role === Role.CUSTOMER) {
        return;
    }
    await verifyOrganizationOwnership(req.user?.uuid as string, organizationUuid);
}