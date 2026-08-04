import express from "express";
import {userRoutes} from "./user.route";
export let mainRouter=express.Router()
mainRouter.use("/users",userRoutes)