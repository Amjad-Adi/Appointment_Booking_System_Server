import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
import {Role} from "../../models/enums/roles"
export const createUserSchema=z.object({
    firstName:z.string().trim().nonempty().max(64),
    lastName:z.string().trim().nonempty().max(64),
    email:z.email(),
    password:z.string().trim().nonempty().max(64),
    confirmPassword:z.string().trim().nonempty().max(64),
    profilePicturePath:z.string().trim().nonempty().default("DEFAULT_PICTURE_PATH"),
    language:z.string().trim().length(2).default("en"),
    role:z.nativeEnum(Role),
}).strict().refine((data)=>data.password===data.confirmPassword);

export const updateUserSchema=z.object({
    firstName:z.string().trim().nonempty().max(64).optional(),
    lastName:z.string().trim().nonempty().max(64).optional(),
    password:z.string().trim().nonempty().max(64).optional(),
    confirmPassword:z.string().trim().nonempty().max(64).optional(),
    profilePicturePath:z.string().trim().nonempty().optional(),
    language:z.string().trim().length(2).optional(),
}).strict().refine((data)=>data.password===data.confirmPassword);

export const updateUserByAdminSchema=z.object({
    role:z.nativeEnum(Role).optional(),
    status:z.nativeEnum(ActivationStatus).optional()
}).strict();