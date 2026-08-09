import express from "express";
import {validate} from "../middlewares/validaiton";
import {createOrganizationSchema, updateOrganizationByAdminSchema,updateOrganizationSchema} from "../middlewares/schemas/organization.schema"
import {handleCreateOrganization,handleGetOrganizations,handleUpdateOrganizationByAdmin,handleGetOrganization,handleUpdateOrganization} from "../controllers/organization.controller";
import {authenticateUser} from "../authentication/firebase.authentication";
import {authorize,authoraizrOrganizationManager} from "../authoraization/autoraization";
import {
    CREATE_ORGANIZATION,
    WRITE_ORGANIZATION,
} from "../permissions/permissions";
import {handleGetCurrentUser, handleUpdateCurrentUser} from "../controllers/user.controller";
import {updateUserSchema} from "../middlewares/schemas/user.schema";
import {userRouter} from "./user.route";
import {serviceRouter} from "./service.route";
export let organizationRouter=express.Router()
organizationRouter.route("/")
    .get(handleGetOrganizations)
    .post(authenticateUser,authorize(CREATE_ORGANIZATION),validate(createOrganizationSchema),handleCreateOrganization)

organizationRouter.route("/:uuid")
    .get(authenticateUser,handleGetOrganization)
    .patch(authenticateUser,authoraizrOrganizationManager,authorize(WRITE_ORGANIZATION),validate(updateOrganizationSchema),handleUpdateOrganization)

organizationRouter.use("/:uuid/services")