import type { Request, Response } from 'express'
import { getAvailableTimes } from '../services/scheduling.service';
import { SchedulingRequest } from '../models/scheduling.model';

export async function handleGetAvailableTimes(req: Request, res: Response) {
    const request:SchedulingRequest = req.body;
    request.organizationUuid =  req.params.organizationUuid as string;
    const result = await getAvailableTimes(request)
    return res.status(200).json(result);
}