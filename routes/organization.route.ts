import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {createOrganizationSchema, updateOrganizationByAdminSchema,updateOrganizationSchema} from "../middlewares/schemas/organization.schema"
import {
    handleCreateOrganization,
    handleGetOrganizations,
    handleUpdateOrganizationByAdmin,
    handleGetOrganization,
    handleUpdateCurrentOrganization, handleGetCurrentOrganization
} from "../controllers/organization.controller";
import {authenticateUser} from "../authentication/firebase.authentication";
import {authorize, authorizeOrganizationManager, rejectWorkingUsers} from "../authoraization/autoraization";
import {
    CREATE_ORGANIZATION,
    WRITE_ORGANIZATION, WRITE_ORGANIZATION_AS_ADMIN,
} from "../permissions/permissions";
import {serviceRouter} from "./service.route";
import {validateUuid} from "../middlewares/schemas/parameters.schema";
export let organizationRouter=express.Router()
organizationRouter.route("/")
    .get(handleGetOrganizations)
    .post(authenticateUser,authorize(CREATE_ORGANIZATION),rejectWorkingUsers,validateBody(createOrganizationSchema),handleCreateOrganization)
organizationRouter.route("/me")
    .get(authenticateUser,handleGetCurrentOrganization)
    .patch(authenticateUser,validateBody(updateOrganizationSchema),handleUpdateCurrentOrganization)

organizationRouter.use("/:uuid/services",serviceRouter)

organizationRouter.route("/:uuid")
    .get(authenticateUser,validateParameter(validateUuid),handleGetOrganization)
    .patch(authenticateUser,authorize(WRITE_ORGANIZATION_AS_ADMIN),validateParameter(validateUuid),validateBody(updateOrganizationByAdminSchema),handleUpdateOrganizationByAdmin)
