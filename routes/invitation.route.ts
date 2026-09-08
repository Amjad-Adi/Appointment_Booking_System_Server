import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
import {CREATE_SERVICE, WRITE_SERVICE} from "../permissions/permissions";
import {validateUuid} from "../middlewares/schemas/parameters.schema";
export let invitationRouter=express.Router()
// invitationRouter.route("/")
//     .get()
//     .post(authenticateUser,authorize(CREATE_SERVICE),validateBody(createServiceSchema),handleCreateService)
//
// invitationRouter.route("/:uuid")
//     .get(validateParameter(validateUuid),handleGetService)
//     .patch(authenticateUser,authorizeOrganizationManager,authorize(WRITE_SERVICE),validateParameter(validateUuid),validateBody(updateServiceSchema),handleUpdateService)