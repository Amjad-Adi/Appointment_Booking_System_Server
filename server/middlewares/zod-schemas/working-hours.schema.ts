import { z} from "zod"

export const updateWorkingHoursSchema=z.object({
    startTimeUTC:z.iso.time().optional(),
    endTimeUTC:z.iso.time().optional(),
}).strict()