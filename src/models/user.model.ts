import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {
    registerUserSchema, queryUserSchema,
    updateUserByAdminSchema, updateUserPasswordSchema,
    updateUserSchema, userFilterSchema, createUserSchema
} from "../middlewares/zod-schemas/user.schema"
import {DataResponses, Filter} from "./query.model";
import {Order} from "./enums/order";

export interface User{
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

export interface UserResponse extends User,DataResponses {
    organizationUuid:string
}
type UpdateUserFields = {
    role?: Role;
    status?: ActivationStatus;
    firstName?: string;
    lastName?: string;
    language?: string;
    profilePicturePath?: string;
    profilePictureId?: string;
};
export type RegisterUser = z.infer<typeof registerUserSchema> & { uid: string; profilePicturePath?: string; profilePictureId?: string};
export type CreateUser = z.infer<typeof createUserSchema> & { uid: string; profilePicturePath?: string; profilePictureId?: string};
export type UpdateUserByAdmin= z.infer<typeof updateUserByAdminSchema> & {uuid:string};
export type UpdateCurrentUser = z.infer<typeof updateUserSchema>& { uuid: string; profilePicturePath?: string; profilePictureId?: string; };
const combinedUpdateUserSchema = updateUserSchema.extend(updateUserByAdminSchema.shape);
export type UpdateUser = z.infer<typeof combinedUpdateUserSchema>&{ uuid: string; profilePicturePath?: string; profilePictureId?: string; };
export type UpdateCurrentUserPassword = z.infer<typeof updateUserPasswordSchema> & {uid:string};
export type QueryUser=z.infer<typeof queryUserSchema>&{offset?:number};