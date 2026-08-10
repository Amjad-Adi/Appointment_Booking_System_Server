import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {createOrganizationSchema, updateOrganizationByAdminSchema,updateOrganizationSchema} from "../middlewares/schemas/organization.schema"
import {handleCreateOrganization,handleGetOrganizations,handleUpdateOrganizationByAdmin,handleGetOrganization,handleUpdateOrganization} from "../controllers/organization.controller";
import {authenticateUser} from "../authentication/firebase.authentication";
import {authorize,authorizeOrganizationManager} from "../authoraization/autoraization";
import {
    CREATE_ORGANIZATION,
    WRITE_ORGANIZATION,
} from "../permissions/permissions";
import {handleGetCurrentUser, handleUpdateCurrentUser} from "../controllers/user.controller";
import {updateUserSchema} from "../middlewares/schemas/user.schema";
import {userRouter} from "./user.route";
import {serviceRouter} from "./service.route";
import {validateUuid} from "../middlewares/schemas/uuid.schema";
export let organizationRouter=express.Router()
organizationRouter.route("/")
    .get(handleGetOrganizations)
    .post(authenticateUser,authorize(CREATE_ORGANIZATION),validateBody(createOrganizationSchema),handleCreateOrganization)

organizationRouter.use("/:uuid/services",serviceRouter)

organizationRouter.route("/:uuid")
    .get(validateParameter(validateUuid),authenticateUser,handleGetOrganization)
    .patch(authenticateUser,authorizeOrganizationManager,authorize(WRITE_ORGANIZATION),validateParameter(validateUuid),validateBody(updateOrganizationSchema),handleUpdateOrganization)
