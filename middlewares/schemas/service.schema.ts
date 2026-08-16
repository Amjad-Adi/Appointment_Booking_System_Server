import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
import {Role} from "../../models/enums/roles"
import {CreateLocation} from "../../models/location.model";
export const createServiceSchema=z.object({
    name:z.string().trim().nonempty().max(256),
    description:z.string().trim().max(4096).nonempty().optional(),
    price:z.number(),
    durationInMinutes:z.number().int().positive(),
    profilePicturePath:z.string().trim().nonempty().optional()
}).strict()


export const updateServiceSchema=createServiceSchema.partial().extend({
    status:z.enum(ActivationStatus).optional()
}).strict()