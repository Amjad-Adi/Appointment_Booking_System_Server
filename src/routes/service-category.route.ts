import express from "express";
import {
    validateBody,
    validateParameter,
    validateQuery
} from "../middlewares/validaiton";
import {
    createServiceCategorySchema,
    updateServiceCategorySchema,
    queryServiceCategorySchema
} from "../middlewares/zod-schemas/service-categoty.schema";
import {
    handleGetServiceCategories,
    handleGetServiceCategory,
    handleCreateServiceCategory,
    handleUpdateServiceCategory
} from "../controllers/service-categoty.controller";
import {authenticateToken} from "../controllers/authentication/jwt.authentication.controller";
import {
    CREATE_SERVICE_CATEGORY,
    UPDATE_SERVICE_CATEGORY
} from "../permissions/permissions";
import {validateUuid} from "../middlewares/zod-schemas/parameters.schema";
import {authorize} from "../middlewares/authorization/authorization";

export const serviceCategoryRouter = express.Router();

serviceCategoryRouter.route("/")
    .get(validateQuery(queryServiceCategorySchema), handleGetServiceCategories)
    .post(authenticateToken, authorize(CREATE_SERVICE_CATEGORY), validateBody(createServiceCategorySchema), handleCreateServiceCategory);

serviceCategoryRouter.route("/:categoryUuid")
    .get(validateParameter(validateUuid, "categoryUuid"), handleGetServiceCategory)
    .patch(authenticateToken, authorize(UPDATE_SERVICE_CATEGORY), validateParameter(validateUuid, "categoryUuid"), validateBody(updateServiceCategorySchema), handleUpdateServiceCategory);