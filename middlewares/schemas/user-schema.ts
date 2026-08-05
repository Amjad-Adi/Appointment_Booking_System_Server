import { z} from "zod"
import {ActivationStatus} from "../../models/enums/model-activation-status"
import {Role} from "../../models/enums/roles"
export let createUserSchema=z.object({
    firstName:z.string().nonempty().max(64),
    lastName:z.string().nonempty().max(64),
    email:z.email(),
    profilePicturePath:z.string().nonempty().default("DEFAULT_PICTURE_PATH"),
    language:z.string().length(2).default("en"),
    role:z.nativeEnum(Role),
}).strict()

export let updateUserSchema=z.object({
    firstName:z.string().nonempty().max(64).optional(),
    lastName:z.string().nonempty().max(64).optional(),
    profilePicturePath:z.string().nonempty().optional(),
    language:z.string().length(2).optional(),
}).strict();

export let updateUserByAdminSchema=z.object({
    role:z.nativeEnum(Role).optional(),
    status:z.nativeEnum(ActivationStatus).optional()
}).strict();