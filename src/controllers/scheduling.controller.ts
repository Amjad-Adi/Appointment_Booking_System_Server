import type { Request, Response } from 'express'
import { getAvailableTimes } from '../services/scheduling.service';
import { getUsers } from '../services/user.service';
import { SchedulingRequest } from '../models/scheduling.model';
import { Role } from '../models/enums/roles';
import { ActivationStatus } from '../models/enums/activation-status';

export async function handleGetAvailableTimes(req: Request, res: Response) {
    const request:SchedulingRequest = req.body;
    request.organizationUuid =  req.params.organizationUuid as string;

    const isCustomer = req.user?.role === Role.CUSTOMER;

    /*
     * Customers can only search availability for themselves and must respect
     * their own active appointments. Organization staff are allowed to
     * double-book a customer on purpose.
     */
    if (isCustomer) {
        request.userUuid = req.user?.uuid as string;
    }

    const result = await getAvailableTimes(request, !isCustomer)
    return res.status(200).json(result);
}

export async function handleGetOrganizationWorkers(req: Request, res: Response) {
    const organizationUuid = req.params.organizationUuid as string;
    const workers = await getUsers({
        page: 1,
        limit: 200,
        offset: 0,
        filter: {
            organizationUuid,
            role: Role.WORKER,
            status: ActivationStatus.ACTIVE,
        },
    });

    return res.status(200).json(
        workers.map((worker) => ({
            uuid: worker.uuid,
            firstName: worker.firstName,
            lastName: worker.lastName,
            profilePicturePath: worker.profilePicturePath,
        })),
    );
}