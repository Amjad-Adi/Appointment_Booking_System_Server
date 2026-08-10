import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {createServiceSchema, updateServiceSchema} from "../middlewares/schemas/service.schema"
import {handleCreateService,handleGetService,handleUpdateService,handleGetServices} from "../controllers/service.controller";
import {authenticateUser} from "../authentication/firebase.authentication";
import {authorize,authorizeOrganizationManager} from "../authoraization/autoraization";
import {CREATE_SERVICE, WRITE_SERVICE} from "../permissions/permissions";
import {validateUuid} from "../middlewares/schemas/uuid.schema";
export let serviceRouter=express.Router()
serviceRouter.route("/")
    .get(handleGetServices)
    .post(authenticateUser,authorize(CREATE_SERVICE),validateBody(createServiceSchema),handleCreateService)

serviceRouter.route("/:uuid")
    .get(validateParameter(validateUuid),handleGetService)
    .patch(authenticateUser,authorizeOrganizationManager,authorize(WRITE_SERVICE),validateParameter(validateUuid),validateBody(updateServiceSchema),handleUpdateService)

