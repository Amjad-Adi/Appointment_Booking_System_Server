"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceCategoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_1 = require("../middlewares/validaiton");
const service_categoty_schema_1 = require("../middlewares/zod-schemas/service-categoty.schema");
const service_categoty_controller_1 = require("../controllers/service-categoty.controller");
const jwt_authentication_controller_1 = require("../controllers/authentication/jwt.authentication.controller");
const permissions_1 = require("../permissions/permissions");
const parameters_schema_1 = require("../middlewares/zod-schemas/parameters.schema");
const authorization_1 = require("../middlewares/authorization/authorization");
exports.serviceCategoryRouter = express_1.default.Router();
exports.serviceCategoryRouter.route("/")
    .get((0, validaiton_1.validateQuery)(service_categoty_schema_1.queryServiceCategorySchema), service_categoty_controller_1.handleGetServiceCategories)
    .post(jwt_authentication_controller_1.authenticateToken, (0, authorization_1.authorize)(permissions_1.CREATE_SERVICE_CATEGORY), (0, validaiton_1.validateBody)(service_categoty_schema_1.createServiceCategorySchema), service_categoty_controller_1.handleCreateServiceCategory);
exports.serviceCategoryRouter.route("/:categoryUuid")
    .get((0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "categoryUuid"), service_categoty_controller_1.handleGetServiceCategory)
    .patch(jwt_authentication_controller_1.authenticateToken, (0, authorization_1.authorize)(permissions_1.UPDATE_SERVICE_CATEGORY), (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "categoryUuid"), (0, validaiton_1.validateBody)(service_categoty_schema_1.updateServiceCategorySchema), service_categoty_controller_1.handleUpdateServiceCategory);
