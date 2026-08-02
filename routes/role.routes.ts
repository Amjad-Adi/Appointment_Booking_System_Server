import express from "express";
import {validate} from "../middlewares/validaiton";
import {createRoleValidation, updateRoleValidation} from "../middlewares/schemas/role-schema"
import {handleCreateRole, handleGetRoles, handleUpdateRole, handleGetRole} from "../controllers/role.controller"
export let roleRoutes=express.Router()
roleRoutes.route("/")
    .get(handleGetRoles)
    .post(validate(createRoleValidation),handleCreateRole)

roleRoutes.route("/:uuid")
    .get(handleGetRole)
    .put(validate(updateRoleValidation),handleUpdateRole)