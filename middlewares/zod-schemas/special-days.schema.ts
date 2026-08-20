import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
export const createSpecialDaysSchema=z.object({
    name:z.string().trim().nonempty().max(256),
    description:z.string().trim().nonempty().max(4096).optional(),
    dayDate:z.iso.date()
}).strict()


export const updateSpecialDaysSchema=z.object({
    name:z.string().trim().nonempty().max(256).optional(),
    description:z.string().trim().nonempty().max(4096).optional(),
    dayDate:z.iso.date().optional(),
    status:z.enum(ActivationStatus).optional(),
}).strict()