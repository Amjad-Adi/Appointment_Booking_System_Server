import express from "express";
import type {} from "../utils/Request.js";
import {validateBody, validateParameter, validateQuery} from "../middlewares/validaiton.js";
import {
    createUserSchema,
    updateUserSchema,
    updateUserByAdminSchema,
    queryUserSchema
} from "../middlewares/zod-schemas/user.schema.js"
import {
    handleGetUser,
    handleCreateUser,
    handleUpdateUserByAdmin,
    handleGetUsers,
    handleGetCurrentUser, handleUpdateCurrentUser
} from "../controllers/user.controller.js";
import {authorize} from "../middlewares/authorization/authorization.js";
import {
    READ_USERS,
    CREATE_USER,
    UPDATE_USER_AS_ADMIN,
} from "../permissions/permissions.js";
import {validateUuid} from "../middlewares/zod-schemas/parameters.schema.js";
import {receiveInvitationRouter} from "./receive-invitation.route.js";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller.js";
export let userRouter=express.Router()
userRouter.route("/")
    .get(authenticateToken,authorize(READ_USERS),validateQuery(queryUserSchema),handleGetUsers)

userRouter.route("/me")
    .get(authenticateToken,handleGetCurrentUser)
    .patch(authenticateToken,validateBody(updateUserSchema),handleUpdateCurrentUser)

userRouter.use("/me/invitations", receiveInvitationRouter)

userRouter.route("/:userUuid")
    .get(authenticateToken,authorize(READ_USERS),validateParameter(validateUuid,"userUuid"),handleGetUser)
    .patch(authenticateToken,authorize(UPDATE_USER_AS_ADMIN),validateParameter(validateUuid,"userUuid"),validateBody(updateUserByAdminSchema),handleUpdateUserByAdmin)
