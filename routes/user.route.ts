import express from "express";
import {validate} from "../middlewares/validaiton";
import {createUserSchema, updateUserSchema,updateUserByAdminSchema} from "../middlewares/schemas/user-schema"
import {handleGetUser,handleCreateUser,handleUpdateUser,handleUpdateUserByAdmin,handleGetUsers} from "../controllers/user.controller";
export let userRoutes=express.Router()
userRoutes.route("/")
    .get(handleGetUsers)
    .post(validate(createUserSchema),handleCreateUser)

userRoutes.route("/:uuid")
    .get(handleGetUser)
    .patch(validate(updateUserSchema),handleUpdateUser)