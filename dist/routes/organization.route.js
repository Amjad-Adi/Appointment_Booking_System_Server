"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRouter = void 0;
const express_1 = __importDefault(require("express"));
const validaiton_1 = require("../middlewares/validaiton");
const organization_schema_1 = require("../middlewares/schemas/organization.schema");
const organization_controller_1 = require("../controllers/organization.controller");
const jwt_authentication_controller_1 = require("../controllers/authentication/jwt.authentication.controller");
const autoraization_1 = require("../middlewares/authoraization/autoraization");
const permissions_1 = require("../permissions/permissions");
const service_route_1 = require("./service.route");
const parameters_schema_1 = require("../middlewares/schemas/parameters.schema");
const roles_1 = require("../models/enums/roles");
const roleSchemas = {
    [roles_1.Role.SUPER_ADMIN]: organization_schema_1.updateOrganizationByAdminSchema,
    [roles_1.Role.OWNER]: organization_schema_1.updateOrganizationSchema,
};
exports.organizationRouter = express_1.default.Router();
exports.organizationRouter.route("/")
    .get(organization_controller_1.handleGetOrganizations)
    .post(jwt_authentication_controller_1.authenticateToken, (0, autoraization_1.authorize)(permissions_1.CREATE_ORGANIZATION), autoraization_1.rejectWorkingUsers, (0, validaiton_1.validateBody)(organization_schema_1.createOrganizationSchema), organization_controller_1.handleCreateOrganization);
exports.organizationRouter.use("/:organizationUuid/services", (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "organizationUuid"), service_route_1.serviceRouter);
exports.organizationRouter.route("/:organizationUuid")
    .get(jwt_authentication_controller_1.authenticateToken, (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "organizationUuid"), organization_controller_1.handleGetOrganization)
    .patch(jwt_authentication_controller_1.authenticateToken, autoraization_1.authorizeOrganizationUser, (0, autoraization_1.authorize)(permissions_1.WRITE_ORGANIZATION), (0, validaiton_1.validateParameter)(parameters_schema_1.validateUuid, "organizationUuid"), (0, validaiton_1.validateBodyByRole)(roleSchemas), organization_controller_1.handleUpdateOrganization);
