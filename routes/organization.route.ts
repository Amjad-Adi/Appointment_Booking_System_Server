import express from "express";
import {validate} from "../middlewares/validaiton";
import {createOrganizationSchema, updateOrganizationByAdminSchema,updateOrganizationSchema} from "../middlewares/schemas/organization-schema"
import {handleCreateOrganization,handleGetOrganizations,handleUpdateOrganizationByAdmin,handleGetOrganization,handleUpdateOrganization} from "../controllers/organization.controller";
export let organizationRouter=express.Router()
organizationRouter.route("/")
    .get(handleGetOrganizations)
    .post(validate(createOrganizationSchema),handleCreateOrganization)

organizationRouter.route("/:uuid")
    .get(handleGetOrganization)
    .patch(validate(updateOrganizationSchema),handleUpdateOrganization)