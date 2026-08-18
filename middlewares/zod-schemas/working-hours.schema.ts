import { z} from "zod"

export const updateWorkingHoursSchema=z.object({
    startTimeUTC:z.iso.date().optional(),
    endTimeUTC:z.iso.date().optional(),
}).strict()