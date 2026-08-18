import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
import {TimeBlockStatus} from "../../models/enums/time-block-status";
export const createTimeBlockSchema=z.object({
    reason:z.string().trim().max(4096),
    startTimeUTC:z.iso.date(),
    endTimeUTC:z.iso.date(),
}).strict()


export const updateTimeBlockSchema=z.object({
    respondedAtUTC:z.iso.date(),
    requestStatus:z.enum(TimeBlockStatus),
}).strict()