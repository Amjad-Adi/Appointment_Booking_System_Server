import type { Request, Response } from "express";

import { getAvailableTimes } from "../services/scheduling.service";

import { AppointmentTimeType } from "../models/enums/appointment-time-type.js";
import {getUserIdByUuid} from "../services/user.service";

export async function handleGetAvailableTimes(req: Request, res: Response,) {
    const organizationUuid = req.params.organizationUuid as string
    const userUuid = req.user?.uuid as string
    const userId =await getUserIdByUuid(userUuid)
    const result = await getAvailableTimes(organizationUuid, {...req.body,userId,});
    return res.status(200).json(result)
}