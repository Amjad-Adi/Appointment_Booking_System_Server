import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {createServiceSchema, updateServiceSchema} from "../middlewares/zod-schemas/service.schema";
import {handleGetOrganizationService, handleUpdateOrganizationService, handleCreateOrganizationService, handleGetOrganizationServices} from "../controllers/service.controller";
import { authenticateToken } from "../controllers/authentication/jwt.authentication.controller";
import {CREATE_SERVICE, UPDATE_SERVICE} from "../permissions/permissions";
import { validateUuid } from "../middlewares/zod-schemas/parameters.schema";
import {authorize} from "../middlewares/authorization/authorization";
export let serviceRouter=express.Router({mergeParams:true});
serviceRouter.route("/")
    .get(handleGetOrganizationServices)
    .post(authenticateToken,authorize(CREATE_SERVICE),validateBody(createServiceSchema),handleCreateOrganizationService)

serviceRouter.route("/:serviceUuid")
    .get(validateParameter(validateUuid,"serviceUuid"),handleGetOrganizationService)
    .patch(authenticateToken,authorize(UPDATE_SERVICE),validateParameter(validateUuid,"serviceUuid"),validateBody(updateServiceSchema),handleUpdateOrganizationService)