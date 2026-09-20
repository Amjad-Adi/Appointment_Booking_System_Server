import express from "express";
import {validateBody, validateParameter} from "../middlewares/validaiton";
import {validateUuid} from "../middlewares/zod-schemas/parameters.schema";
import {
    authenticateToken
} from "../controllers/authentication/jwt.authentication.controller";
import {
    authorize
} from "../middlewares/authorization/authorization";
import {
    CREATE_SERVICE,
    UPDATE_SERVICE
} from "../permissions/permissions";
import {
    handleCreateServiceJunctionCategories,
    handleUpdateServiceJunctionCategories
} from "../controllers/service-junction-category.conroller"
import {
    createServiceJunctionCategorySchema,
    updateServiceJunctionCategorySchema
} from "../middlewares/zod-schemas/service-category-junction.schema";

export const serviceJunctionCategoryRouter = express.Router({
    mergeParams: true
});

serviceJunctionCategoryRouter.route("/")
    .post(authenticateToken, authorize(CREATE_SERVICE), validateParameter(validateUuid, "serviceUuid"), validateBody(createServiceJunctionCategorySchema), handleCreateServiceJunctionCategories)
    .patch(authenticateToken, authorize(UPDATE_SERVICE), validateParameter(validateUuid, "serviceUuid"), validateBody(updateServiceJunctionCategorySchema), handleUpdateServiceJunctionCategories);