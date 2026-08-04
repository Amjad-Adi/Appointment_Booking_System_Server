import { z} from "zod"
import {ActivationStatus} from "../../models/enums/model-activation-status"
import {Role} from "../../models/enums/roles"
export let createUserSchema=z.object({
    firstName:z.string().nonempty().max(64).nonempty(),
    lastName:z.string().nonempty().max(64).nonempty(),
    email:z.email(),
    profilePicturePath:z.string().nonempty().default("DEFAULT_PICTURE_PATH"),
    createdAtUTC:z.iso.datetime().default(new Date().toISOString()),
    language:z.string().length(2).default("en"),
    role:z.nativeEnum(Role),
    status:z.nativeEnum(ActivationStatus).default(ActivationStatus.ACTIVE)
}).strict()

export let updateUserSchema=z.object({
    firstName:z.string().nonempty().max(64).nonempty().optional(),
    lastName:z.string().nonempty().max(64).nonempty().optional(),
    profilePicturePath:z.string().nonempty().default("DEFAULT_PICTURE_PATH"),
    updatedAtUTC:z.iso.datetime().default(new Date().toISOString()),
    language:z.string().length(2).default("en"),
}).strict();

export let updateUserByAdminSchema=z.object({
    updatedAtUTC:z.iso.datetime().default(new Date().toISOString()),
    role:z.nativeEnum(Role).optional(),
    status:z.nativeEnum(ActivationStatus).optional()
}).strict();