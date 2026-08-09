import express from "express";
import type {} from "../utils/UserRequest";
import {validate} from "../middlewares/validaiton";
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
export let userRouter=express.Router()
userRouter.route("/")
    .get(authenticateUser,authorize(READ_USERS),handleGetUsers)
    .post(authenticateUser,authorize(CREATE_USER),validate(createUserSchema),handleCreateUser)

userRouter.route("/me")
    .get(authenticateUser,handleGetCurrentUser)
    .patch(authenticateUser,validate(updateUserSchema),handleUpdateCurrentUser)

userRouter.route("/:uuid")
    .get(authenticateUser,authorize(READ_USER),handleGetUser)
    .patch(authenticateUser,authorize(WRITE_USER_AS_ADMIN),validate(updateUserByAdminSchema),handleUpdateUser)

userRouter.route("/register")
    .post(validate(createUserSchema),handleCreateUser)
