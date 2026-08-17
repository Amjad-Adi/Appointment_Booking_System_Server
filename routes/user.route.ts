import express from "express";
import type {} from "../utils/UserRequest";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {createUserSchema, updateUserSchema,updateUserByAdminSchema} from "../middlewares/zod-schemas/user.schema"
import {
    handleGetUser,
    handleCreateUser,
    handleUpdateUserByAdmin,
    handleGetUsers,
    handleGetCurrentUser, handleUpdateCurrentUser
} from "../controllers/user.controller";
import {authorize} from "../middlewares/authorization/authorization";
import {
    READ_USERS,
    CREATE_USER,
    UPDATE_USER_AS_ADMIN,
} from "../permissions/permissions";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
import {validateUuid} from "../middlewares/zod-schemas/parameters.schema";
import {receiveInvitationRouter} from "./receive-invitation.route";
export let userRouter=express.Router()
userRouter.route("/")
    .get(authenticateToken,authorize(READ_USERS),handleGetUsers)

userRouter.route("/me")
    .get(authenticateToken,handleGetCurrentUser)
    .patch(authenticateToken,validateBody(updateUserSchema),handleUpdateCurrentUser)

userRouter.use("/me/invitations", receiveInvitationRouter)

userRouter.route("/:userUuid")
    .get(authenticateToken,authorize(READ_USERS),validateParameter(validateUuid,"userUuid"),handleGetUser)
    .patch(authenticateToken,authorize(UPDATE_USER_AS_ADMIN),validateParameter(validateUuid,"userUuid"),validateBody(updateUserByAdminSchema),handleUpdateUserByAdmin)
