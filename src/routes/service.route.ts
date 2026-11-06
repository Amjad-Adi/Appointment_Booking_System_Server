import express from "express";
import { validateBody, validateParameter, validateQuery } from "../middlewares/validaiton";
import { createServiceSchema, queryServiceSchema, updateServiceSchema } from "../middlewares/zod-schemas/service.schema";
import { handleGetService, handleGetServices, handleCreateOrganizationService, handleUpdateOrganizationService, } from "../controllers/service.controller";
import { authenticateOptionalToken, authenticateToken } from "../controllers/authentication/jwt.authentication.controller";
import { CREATE_SERVICE, UPDATE_SERVICE } from "../permissions/permissions";
import { validateUuid } from "../middlewares/zod-schemas/parameters.schema";
import { authorize } from "../middlewares/authorization/authorization";
import { serviceJunctionCategoryRouter } from "./service-junction-category.route";
import { serviceReviewRouter } from "./review.route";
import { handleSingleUpload } from '../config/multer';
import { CLOUDINARY_PICTURE_PATH } from '../databases/contracts/service.contract';

export const publicServiceRoute=express.Router();
publicServiceRoute.route("/")
    .get(authenticateOptionalToken, validateQuery(queryServiceSchema), handleGetServices);

publicServiceRoute.use("/:serviceUuid/reviews", validateParameter(validateUuid, "serviceUuid"), serviceReviewRouter);

publicServiceRoute.route("/:serviceUuid")
    .get(authenticateOptionalToken, validateParameter(validateUuid, "serviceUuid"), handleGetService,);

export const serviceRouter = express.Router({mergeParams: true,});

serviceRouter.route("/")
    .get(authenticateToken,validateQuery(queryServiceSchema), handleGetServices)
    .post(authenticateToken, authorize(CREATE_SERVICE), handleSingleUpload(CLOUDINARY_PICTURE_PATH), validateBody(createServiceSchema), handleCreateOrganizationService);

serviceRouter.route("/:serviceUuid")
    .get(authenticateToken,validateParameter(validateUuid, "serviceUuid"), handleGetService)
    .patch(authenticateToken, authorize(UPDATE_SERVICE), validateParameter(validateUuid, "serviceUuid"), handleSingleUpload(CLOUDINARY_PICTURE_PATH), validateBody(updateServiceSchema),handleUpdateOrganizationService);

serviceRouter.use("/:serviceUuid/categories", validateParameter(validateUuid, "serviceUuid"), serviceJunctionCategoryRouter);
serviceRouter.use("/:serviceUuid/reviews", validateParameter(validateUuid, "serviceUuid"), serviceReviewRouter);