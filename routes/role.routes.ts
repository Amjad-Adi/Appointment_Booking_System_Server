import express from "express";
import {validate} from "../middlewares/validaiton";
import {roleValidation} from "../middlewares/schemas/role-schema"
import {handleCreateRole, handleGetRoles, handleUpdateRole, handleGetRole} from "../controllers/role.controller"
export let roleRoutes=express.Router()
roleRoutes.route("/roles")
    .get(handleGetRoles)
    .post(validate(roleValidation),handleCreateRole)

roleRoutes.route("/roles/:uuid")
    .get(handleGetRole)
    .put(validate(roleValidation),handleUpdateRole)