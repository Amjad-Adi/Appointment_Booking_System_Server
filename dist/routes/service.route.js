"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRouter = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_1 = require("../middlewares/validaiton");
const service_schema_1 = require("../middlewares/schemas/service.schema");
const service_controller_1 = require("../controllers/service.controller");
const jwt_authentication_controller_1 = require("../controllers/authentication/jwt.authentication.controller");
const autoraization_1 = require("../middlewares/authoraization/autoraization");
const permissions_1 = require("../permissions/permissions");
const parameters_schema_1 = require("../middlewares/schemas/parameters.schema");
exports.serviceRouter = express_1.default.Router({ mergeParams: true });
exports.serviceRouter.route("/")
    .get(service_controller_1.handleGetOrganizationServices)
    .post(jwt_authentication_controller_1.authenticateToken, autoraization_1.authorizeOrganizationUser, (0, autoraization_1.authorize)(permissions_1.CREATE_SERVICE), (0, validaiton_1.validateBody)(service_schema_1.createServiceSchema), service_controller_1.handleCreateOrganizationService);
exports.serviceRouter.route("/:serviceUuid")
    .get((0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "serviceUuid"), service_controller_1.handleGetOrganizationService)
    .patch(jwt_authentication_controller_1.authenticateToken, autoraization_1.authorizeOrganizationUser, (0, autoraization_1.authorize)(permissions_1.WRITE_SERVICE), (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "serviceUuid"), (0, validaiton_1.validateBody)(service_schema_1.updateServiceSchema), service_controller_1.handleUpdateOrganizationService);
