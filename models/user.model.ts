import {Role} from "./enums/roles";
import {z} from "zod"
import {ActivationStatus} from "./enums/activation-status";
import {
    createUserSchema,
    inviteUserSchema, queryUserSchema,
    updateUserByAdminSchema,
    updateUserSchema
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

export interface UserFilter extends Filter{
    role:Role
    status:ActivationStatus
}

export type CreateUser= z.infer<typeof createUserSchema> & {uid:string};
export type InviteUser= z.infer<typeof inviteUserSchema>;
export type UpdateUser= z.infer<typeof updateUserSchema> & {uid:string ,uuid:string};
export type UpdateUserByAdmin= z.infer<typeof updateUserByAdminSchema> & {uuid:string};
export type QueryUser=z.infer<typeof queryUserSchema>&{offset:number};