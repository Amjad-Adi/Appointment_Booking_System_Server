import { z} from "zod"
import {ActivationStatus} from "../../models/enums/activation-status"
import {Role} from "../../models/enums/roles"
export const createUserSchema=z.object({
    firstName:z.string().trim().nonempty().max(64),
    lastName:z.string().trim().nonempty().max(64),
    email:z.email(),
    password:z.string().trim().nonempty().max(64),
    confirmPassword:z.string().trim().nonempty().max(64),
    profilePicturePath:z.string().trim().nonempty().optional(),
    language:z.string().trim().length(2).default("en"),
    role:z.enum(Role).refine((role)=>(role==Role.CUSTOMER||role==Role.OWNER)),
}).strict().refine((data)=>data.password===data.confirmPassword)

export const inviteUserSchema=z.object({
    firstName:z.string().trim().nonempty().max(64),
    lastName:z.string().trim().nonempty().max(64),
    email:z.email(),
    role:z.enum(Role).refine((role)=>(role!=Role.SUPER_ADMIN&&role!=Role.CUSTOMER)),
}).strict();

export const updateUserSchema=z.object({
    firstName:z.string().trim().nonempty().max(64).optional(),
    lastName:z.string().trim().nonempty().max(64).optional(),
    password:z.string().trim().nonempty().max(64).optional(),
    confirmPassword:z.string().trim().nonempty().max(64).optional(),
    profilePicturePath:z.string().trim().nonempty().optional(),
    language:z.string().trim().length(2).optional(),
}).strict().refine((data)=>data.password===data.confirmPassword);

export const loginUserSchema=z.object({
    email:z.email(),
    password:z.string().trim().nonempty().max(64)
}).strict();

export const updateUserByAdminSchema=z.object({
    role:z.enum(Role).optional(),
    status:z.enum(ActivationStatus).optional()
}).strict();