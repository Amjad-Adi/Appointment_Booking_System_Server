import express from "express";
import {validate} from "../middlewares/validaiton";
import {createServiceSchema, updateServiceSchema} from "../middlewares/schemas/service.schema"
import {handleCreateService,handleGetService,handleUpdateService,handleGetServices} from "../controllers/service.controller";
import {authenticateUser} from "../authentication/firebase.authentication";
import {authorize,authoraizrOrganizationManager} from "../authoraization/autoraization";
import {CREATE_SERVICE, WRITE_SERVICE} from "../permissions/permissions";
export let serviceRouter=express.Router()
serviceRouter.route("/")
    .get(handleGetServices)
    .post(authenticateUser,authorize(CREATE_SERVICE),validate(createServiceSchema),handleCreateService)

serviceRouter.route("/:uuid")
    .get(handleGetService)
    .patch(authenticateUser,authoraizrOrganizationManager,authorize(WRITE_SERVICE),validate(updateServiceSchema),handleUpdateService)

