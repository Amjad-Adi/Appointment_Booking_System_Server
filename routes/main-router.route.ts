import express from "express";
import {userRouter} from "./user.route";
import {organizationRouter} from "./organization.route";
export let mainRouter=express.Router()
mainRouter.use("/users",userRouter)
mainRouter.use("/organizations",organizationRouter)