import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/model-activation-status";
import {createUserSchema,updateUserByAdminSchema,updateUserSchema} from "../middlewares/schemas/user-schema"

export interface UserResponse{
    uuid:string,
    firstName:string,
    lastName:string,
    email:string,
    profilePicturePath:string,
    createdAtUTC:Date,
    updatedAtUTC:Date,
    language:string,
    role:Role,
    status:ActivationStatus
}
export type CreateUser= z.infer<typeof createUserSchema>;
export type UpdateUser= z.infer<typeof updateUserSchema>;
export type UpdateUserByAdmin= z.infer<typeof updateUserByAdminSchema>;
