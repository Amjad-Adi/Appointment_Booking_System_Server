"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRouter = exports.publicServiceRoute = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_1 = require("../middlewares/validaiton");
const service_schema_1 = require("../middlewares/zod-schemas/service.schema");
const service_controller_1 = require("../controllers/service.controller");
const jwt_authentication_controller_1 = require("../controllers/authentication/jwt.authentication.controller");
const permissions_1 = require("../permissions/permissions");
const parameters_schema_1 = require("../middlewares/zod-schemas/parameters.schema");
const authorization_1 = require("../middlewares/authorization/authorization");
const service_junction_category_route_1 = require("./service-junction-category.route");
exports.publicServiceRoute = express_1.default.Router();
exports.publicServiceRoute.route("/")
    .get((0, validaiton_1.validateQuery)(service_schema_1.queryServiceSchema), service_controller_1.handleGetServices);
exports.publicServiceRoute.route("/:serviceUuid")
    .get((0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "serviceUuid"), service_controller_1.handleGetService);
exports.serviceRouter = express_1.default.Router({ mergeParams: true, });
exports.serviceRouter.route("/")
    .get(jwt_authentication_controller_1.authenticateToken, (0, validaiton_1.validateQuery)(service_schema_1.queryServiceSchema), service_controller_1.handleGetServices)
    .post(jwt_authentication_controller_1.authenticateToken, (0, authorization_1.authorize)(permissions_1.CREATE_SERVICE), (0, validaiton_1.validateBody)(service_schema_1.createServiceSchema), service_controller_1.handleCreateOrganizationService);
exports.serviceRouter.route("/:serviceUuid")
    .get(jwt_authentication_controller_1.authenticateToken, (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "serviceUuid"), service_controller_1.handleGetService)
    .patch(jwt_authentication_controller_1.authenticateToken, (0, authorization_1.authorize)(permissions_1.UPDATE_SERVICE), (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "serviceUuid"), (0, validaiton_1.validateBody)(service_schema_1.updateServiceSchema), service_controller_1.handleUpdateOrganizationService);
exports.serviceRouter.use("/:serviceUuid/categories", (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "serviceUuid"), service_junction_category_route_1.serviceJunctionCategoryRouter);
