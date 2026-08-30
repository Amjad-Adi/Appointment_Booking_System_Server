import express from "express";
import {validateBody, validateParameter, validateQuery} from "../middlewares/validaiton.js";
import {createServiceSchema, queryServiceSchema, updateServiceSchema} from "../middlewares/zod-schemas/service.schema.js";
import {handleGetOrganizationService, handleUpdateOrganizationService, handleCreateOrganizationService, handleGetOrganizationServices} from "../controllers/service.controller.js";
import { authenticateToken } from "../controllers/authentication/jwt.authentication.controller.js";
import {CREATE_SERVICE, UPDATE_SERVICE} from "../permissions/permissions.js";
import { validateUuid } from "../middlewares/zod-schemas/parameters.schema.js";
import {authorize} from "../middlewares/authorization/authorization.js";
import {queryUserSchema} from "../middlewares/zod-schemas/user.schema.js";
export let serviceRouter=express.Router({mergeParams:true});
serviceRouter.route("/")
    .get(validateQuery(queryServiceSchema),handleGetOrganizationServices)
    .post(authenticateToken,authorize(CREATE_SERVICE),validateBody(createServiceSchema),handleCreateOrganizationService)

serviceRouter.route("/:serviceUuid")
    .get(validateParameter(validateUuid,"serviceUuid"),handleGetOrganizationService)
    .patch(authenticateToken,authorize(UPDATE_SERVICE),validateParameter(validateUuid,"serviceUuid"),validateBody(updateServiceSchema),handleUpdateOrganizationService)