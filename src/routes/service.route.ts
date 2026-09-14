import express from "express";

import {
    validateBody,
    validateParameter,
    validateQuery,
} from "../middlewares/validaiton";

import {
    createServiceSchema,
    queryServiceSchema,
    updateServiceSchema,
} from "../middlewares/zod-schemas/service.schema";

import {
    handleGetService,
    handleGetServices,
    handleCreateOrganizationService,
    handleUpdateOrganizationService,
} from "../controllers/service.controller";

import {
    authenticateToken,
} from "../controllers/authentication/jwt.authentication.controller";

import {
    CREATE_SERVICE,
    UPDATE_SERVICE,
} from "../permissions/permissions";

import {
    validateUuid,
} from "../middlewares/zod-schemas/parameters.schema";

import {
    authorize,
} from "../middlewares/authorization/authorization";

import {
    serviceJunctionCategoryRouter,
} from "./service-junction-category.route";

export const publicServiceRoute=express.Router();
publicServiceRoute.route("/")
    .get(validateQuery(queryServiceSchema), handleGetServices,);

publicServiceRoute.route("/:serviceUuid")
    .get(validateParameter(validateUuid, "serviceUuid"), handleGetService,);

export const serviceRouter = express.Router({mergeParams: true,});

serviceRouter.route("/")
    .post(authenticateToken, authorize(CREATE_SERVICE), validateBody(createServiceSchema), handleCreateOrganizationService,);

serviceRouter.route("/:serviceUuid")
    .patch(authenticateToken, authorize(UPDATE_SERVICE), validateParameter(validateUuid, "serviceUuid"), validateBody(updateServiceSchema), handleUpdateOrganizationService,);

serviceRouter.use("/:serviceUuid/categories", validateParameter(validateUuid, "serviceUuid"), serviceJunctionCategoryRouter,);