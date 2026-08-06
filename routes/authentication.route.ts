import express from "express";
import type {} from "../utils/UserRequest";
import {validate} from "../middlewares/validaiton";
import {createUserSchema, updateUserSchema,updateUserByAdminSchema} from "../middlewares/schemas/user-schema"
import {handleGetUser,handleCreateUser,handleUpdateUser,handleUpdateUserByAdmin,handleGetUsers} from "../controllers/user.controller";
import {authorize} from "../authoraization/autoraization";
import {CREATE_USER_PERMISSION, GET_USERS_PERMISSION} from "../permissions/permissions";
import {authenticateUser} from "../authentication/firebase.authentication";
export let authenticationRouter=express.Router()
authenticationRouter.route("/lgoin")
    .get(authenticateUser,authorize(GET_USERS_PERMISSION),handleGetUsers)
    .post(authenticateUser,authorize(CREATE_USER_PERMISSION),validate(createUserSchema),handleCreateUser)

authenticationRouter.route("/:uuid")
    .get(handleGetUser)
    .patch(validate(updateUserSchema),handleUpdateUser)