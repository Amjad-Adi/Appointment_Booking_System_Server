import { z} from "zod"
import {ActivationStatus} from "../../models/enums/model-activation-status"
import {Role} from "../../models/enums/roles"
import {CreateLocation} from "../../models/location.model";
export const createServiceSchema=z.object({
    name:z.string().trim().nonempty().max(256),
    description:z.string().trim().max(4096).nonempty().optional(),
    price:z.number(),
    durationInMinutes:z.string().trim().max(4096).nonempty(),
    profilePicturePath:z.string().trim().nonempty().default("DEFAULT_PICTURE_PATH"),
}).strict()


export const updateServiceSchema=z.object({
    name:z.string().trim().nonempty().max(256).optional(),
    description:z.string().trim().max(4096).nonempty().optional(),
    price:z.number().optional(),
    durationInMinutes:z.string().trim().max(4096).nonempty().optional(),
    profilePicturePath:z.string().trim().nonempty().optional(),
    status:z.nativeEnum(ActivationStatus).optional()
}).strict()