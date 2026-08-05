import express from "express";
import {validate} from "../middlewares/validaiton";
import {createUserSchema, updateUserSchema,updateUserByAdminSchema} from "../middlewares/schemas/user-schema"
import {handleGetUser,handleCreateUser,handleUpdateUser,handleUpdateUserByAdmin,handleGetUsers} from "../controllers/user.controller";
export let userRouter=express.Router()
userRouter.route("/")
    .get(handleGetUsers)
    .post(validate(createUserSchema),handleCreateUser)

userRouter.route("/:uuid")
    .get(handleGetUser)
    .patch(validate(updateUserSchema),handleUpdateUser)