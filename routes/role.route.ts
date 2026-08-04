import express from "express";
import {validate} from "../middlewares/validaiton";
import {createRoleValidation, updateRoleValidation} from "../middlewares/schemas/role-schema"
import {handleCreateRole, handleGetRoles, handleUpdateRole, handleGetRole} from "../controllers/role.controller"
export let roleRoute=express.Router()
roleRoute.route("/")
    .get(handleGetRoles)
    .post(validate(createRoleValidation),handleCreateRole)

roleRoute.route("/:uuid")
    .get(handleGetRole)
    .put(validate(updateRoleValidation),handleUpdateRole)