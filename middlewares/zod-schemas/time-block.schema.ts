import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
import {TimeBlockStatus} from "../../models/enums/time-block-status";
export const createTimeBlockSchema=z.object({
    reason:z.string().trim().nonempty().max(4096),
    startAtUTC:z.iso.datetime({offset:true}),
    endAtUTC:z.iso.datetime({offset:true}),
}).strict()


export const updateTimeBlockSchema=z.object({
    respondedAtUTC:z.iso.datetime({offset:true}),
    requestStatus:z.enum(TimeBlockStatus),
}).strict()