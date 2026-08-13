import express from "express";
import {validateBody, validateBodyByRole, validateParameter} from "../middlewares/validaiton";
import {createServiceSchema, updateServiceSchema} from "../middlewares/schemas/service.schema"
import {handleGetOrganizationService,handleUpdateOrganizationService,handleCreateOrganizationService,handleGetOrganizationServices} from "../controllers/service.controller";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
<<<<<<< Updated upstream
import {authorize,authorizeOrganizationUser} from "../middlewares/authoraization/autoraization";
import {CREATE_SERVICE, WRITE_ORGANIZATION, WRITE_SERVICE} from "../permissions/permissions";
=======
import {authorize,authorizeOrganizationUser} from "../authoraization/autoraization";
import {CREATE_SERVICE, UPDATE_SERVICE} from "../permissions/permissions";
>>>>>>> Stashed changes
import {validateUuid} from "../middlewares/schemas/parameters.schema";
import {handleUpdateOrganization} from "../controllers/organization.controller";
import {Role} from "../models/enums/roles";
export let serviceRouter=express.Router({mergeParams:true});
serviceRouter.route("/")
    .get(handleGetOrganizationServices)
    .post(authenticateToken,authorizeOrganizationUser,authorize(CREATE_SERVICE),validateBody(createServiceSchema),handleCreateOrganizationService)

serviceRouter.route("/:serviceUuid")
    .get(validateParameter(validateUuid,"serviceUuid"),handleGetOrganizationService)
    .patch(authenticateToken,authorizeOrganizationUser,authorize(UPDATE_SERVICE),validateParameter(validateUuid,"serviceUuid"),validateBody(updateServiceSchema),handleUpdateOrganizationService)