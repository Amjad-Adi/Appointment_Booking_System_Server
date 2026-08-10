import express from "express";
import type {} from "../utils/UserRequest";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {createUserSchema, updateUserSchema,updateUserByAdminSchema} from "../middlewares/schemas/user.schema"
import {
    handleGetUser,
    handleCreateUser,
    handleUpdateUser,
    handleUpdateUserByAdmin,
    handleGetUsers,
    handleGetCurrentUser, handleUpdateCurrentUser
} from "../controllers/user.controller";
import {authorize} from "../authoraization/autoraization";
import {
    READ_USERS,
    READ_USER,
    CREATE_USER,
    WRITE_USER_AS_ADMIN,
} from "../permissions/permissions";
import {authenticateUser} from "../authentication/firebase.authentication";
import {validateUuid} from "../middlewares/schemas/uuid.schema";
export let userRouter=express.Router()
userRouter.route("/")
    .get(authenticateUser,authorize(READ_USERS),handleGetUsers)
    .post(authenticateUser,authorize(CREATE_USER),validateBody(createUserSchema),handleCreateUser)

userRouter.route("/me")
    .get(authenticateUser,handleGetCurrentUser)
    .patch(authenticateUser,validateBody(updateUserSchema),handleUpdateCurrentUser)

userRouter.route("/register")
    .post(validateBody(createUserSchema),handleCreateUser)

userRouter.route("/:uuid")
    .get(authenticateUser,authorize(READ_USER),validateParameter(validateUuid),handleGetUser)
    .patch(authenticateUser,authorize(WRITE_USER_AS_ADMIN),validateParameter(validateUuid),validateBody(updateUserByAdminSchema),handleUpdateUser)
